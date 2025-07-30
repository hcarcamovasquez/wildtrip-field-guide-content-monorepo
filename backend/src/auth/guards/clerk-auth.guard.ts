import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerkClient;
  private secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('clerk.secretKey') || '';
    this.clerkClient = createClerkClient({
      secretKey: this.secretKey,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // Get session token from __session cookie
      const sessionToken = request.cookies.__session;

      if (!sessionToken) {
        throw new UnauthorizedException('No session token found');
      }

      // Verify the token
      const jwt = await verifyToken(sessionToken, {
        secretKey: this.secretKey,
      });

      const userId = jwt.sub;

      // Get user details from Clerk
      const clerkUser = await this.clerkClient.users.getUser(userId);

      // Set user on request
      request.user = {
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        role: (clerkUser.publicMetadata?.role as string) || 'user',
        clerkUser,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}