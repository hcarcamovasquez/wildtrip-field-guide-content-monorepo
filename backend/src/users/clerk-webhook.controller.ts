import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';

interface ClerkWebhookEvent {
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    username: string | null;
    profile_image_url: string | null;
    image_url: string | null;
    primary_email_address_id: string | null;
    created_at: number;
    updated_at: number;
    public_metadata?: Record<string, any>;
  };
  object: string;
  type: string;
  timestamp: number;
  instance_id?: string;
}

@Controller('api/webhooks/clerk')
export class ClerkWebhookController {
  private webhook: Webhook;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    const webhookSecret = this.configService.get<string>(
      'CLERK_WEBHOOK_SECRET',
    );
    if (webhookSecret) {
      this.webhook = new Webhook(webhookSecret);
    }
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleWebhook(
    @Body() payload: any,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ) {
    // Skip verification in development if webhook secret is not configured
    if (this.webhook) {
      // Verify webhook signature
      try {
        const payloadString = JSON.stringify(payload);
        this.webhook.verify(payloadString, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (error) {
        console.error('Webhook verification failed:', error);
        throw new BadRequestException('Invalid webhook signature');
      }
    } else {
      console.warn(
        'Webhook signature verification skipped - CLERK_WEBHOOK_SECRET not configured',
      );
    }

    const event = payload as ClerkWebhookEvent;

    // Handle user.created event
    if (event.type === 'user.created') {
      console.log('Processing user.created webhook:', event.data.id);

      const userData = event.data;
      const primaryEmail = userData.email_addresses?.[0]?.email_address;

      // En desarrollo, podemos crear usuarios sin email para pruebas
      if (!primaryEmail && process.env.NODE_ENV === 'production') {
        console.error('No email found for user:', userData.id);
        return; // 204 No Content
      }

      try {
        // Check if user already exists
        const existingUser = await this.usersService.findByClerkId(userData.id);
        
        if (existingUser) {
          console.log('User already exists, skipping creation:', userData.id);
          return; // 204 No Content
        }

        // Extract role from public_metadata if available
        const role = userData.public_metadata?.role || 'user';

        // Create user in database
        await this.usersService.createUserFromClerk({
          clerkId: userData.id,
          email: primaryEmail || `${userData.id}@example.com`, // Fallback email for dev
          name:
            [userData.first_name, userData.last_name]
              .filter(Boolean)
              .join(' ') || null,
          username: userData.username,
          profileImageUrl: userData.profile_image_url || userData.image_url,
          role,
        });

        console.log('User created successfully:', userData.id);
      } catch (error) {
        console.error('Failed to create user:', error);
        // Don't throw error to avoid webhook retries
      }
      return; // 204 No Content
    }

    // Handle user.updated event
    if (event.type === 'user.updated') {
      console.log('Processing user.updated webhook:', event.data.id);

      const userData = event.data;
      const primaryEmail = userData.email_addresses?.[0]?.email_address;
      const role = userData.public_metadata?.role;

      try {
        await this.usersService.updateUserFromClerk({
          clerkId: userData.id,
          email: primaryEmail,
          name:
            [userData.first_name, userData.last_name]
              .filter(Boolean)
              .join(' ') || null,
          username: userData.username,
          profileImageUrl: userData.profile_image_url || userData.image_url,
          role,
        });

        console.log('User updated successfully:', userData.id);
      } catch (error) {
        console.error('Failed to update user:', error);
      }
      return; // 204 No Content
    }

    // Handle user.deleted event
    if (event.type === 'user.deleted') {
      console.log('Processing user.deleted webhook:', event.data.id);

      try {
        await this.usersService.deleteUserByClerkId(event.data.id);
        console.log('User deleted successfully:', event.data.id);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
      return; // 204 No Content
    }

    // Return 204 for unhandled events
    console.log('Unhandled webhook event:', event.type);
    return; // 204 No Content
  }
}
