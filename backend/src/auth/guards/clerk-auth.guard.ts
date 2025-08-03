import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerkClient;
  private secretKey: string;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    this.secretKey = this.configService.get<string>('clerk.secretKey') || 
                    this.configService.get<string>('CLERK_SECRET_KEY') || 
                    process.env.CLERK_SECRET_KEY || '';
    if (this.secretKey) {
      this.clerkClient = createClerkClient({
        secretKey: this.secretKey,
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    try {
      // Get session token from __session cookie or Authorization header
      let sessionToken = request.cookies.__session;

      // If no cookie token, check Authorization header
      if (!sessionToken) {
        const authHeader = request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          sessionToken = authHeader.substring(7);
        }
      }

      if (!sessionToken) {
        throw new UnauthorizedException('No session token found');
      }

      // Verify the token
      const jwt = await verifyToken(sessionToken, {
        secretKey: this.secretKey,
      });

      const userId = jwt.sub;

      // Get metadata from JWT token
      const metadata =
        (jwt as any).metadata || (jwt as any).publicMetadata || {};
      const roleFromToken = metadata.role;
      const userIdFromToken = metadata.userId;

      // Get user details from Clerk
      const clerkUser = await this.clerkClient.users.getUser(userId);

      // Set user on request - use role from JWT token metadata
      request.user = {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        role:
          roleFromToken || (clerkUser.publicMetadata?.role as string) || 'user',
        dbUserId: userIdFromToken,
        clerkUser,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
