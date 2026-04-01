import axios from 'axios';
import { google } from 'googleapis';
import { SubscriptionStatus } from '../app/modules/subscription/subscription.constants';
import config from '../config';
import { AppleVerificationResult, GoogleVerificationResult } from '../types/purchase';

export async function getGoogleAccessToken() {
     const auth = new google.auth.GoogleAuth({
          keyFile: 'service-account.json', // path to your JSON key
          scopes: ['https://www.googleapis.com/auth/androidpublisher'],
     });

     const client = await auth.getClient();
     const tokenResponse = await client.getAccessToken();
     return tokenResponse.token || '';
}

export async function verifyGooglePurchase(subscriptionId: string, purchaseToken: string): Promise<GoogleVerificationResult> {
     const packageName = config.google.package_name; // static
     const accessToken = await getGoogleAccessToken();

     try {
          const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;

          const response = await axios.get(url, {
               headers: {
                    Authorization: `Bearer ${accessToken}`,
               },
          });

          const data = response.data;

          const startDateMs = parseInt(data.startTimeMillis, 10);
          const expiryDateMs = parseInt(data.expiryTimeMillis, 10);
          const startedAt = new Date(startDateMs) || new Date();
          const expiresAt = new Date(expiryDateMs);

          let status: SubscriptionStatus = SubscriptionStatus.PENDING;
          if (data.paymentState === 1) {
               status = SubscriptionStatus.ACTIVE;
          } else if (data.cancelReason !== undefined) {
               status = SubscriptionStatus.CANCELED;
          } else if (Date.now() > expiryDateMs) {
               status = SubscriptionStatus.EXPIRED;
          }

          return {
               valid: true,
               startedAt,
               expiresAt,
               status,
               orderId: data.orderId, // unique across renewals
               linkedPurchaseToken: data.linkedPurchaseToken, // optional, useful for upgrades/downgrades
          };
     } catch (error: any) {
          console.error('Google verification failed:', error.response?.data || error.message);
          return {
               valid: false,
               status: SubscriptionStatus.PENDING,
          };
     }
}

export async function verifyAppleReceipt(transactionReceipt: string, productId: string): Promise<AppleVerificationResult> {
     try {
          const SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';
          const LIVE_URL = 'https://buy.itunes.apple.com/verifyReceipt';
          const url = config.apple.purchase_mode === 'live' ? LIVE_URL : SANDBOX_URL;

          const response = await axios.post(url, {
               'receipt-data': transactionReceipt,
               'password': config.apple.shared_secret,
          });

          const data = response.data;

          if (data.status !== 0) {
               // Non-zero means invalid receipt
               return { valid: false, status: SubscriptionStatus.PENDING };
          }

          const latest = data.latest_receipt_info?.[0];
          if (!latest) {
               return { valid: false, status: SubscriptionStatus.PENDING };
          }

          // Validate productId
          if (latest.product_id !== productId) {
               console.error(`Product ID mismatch: expected ${productId}, got ${latest.product_id}`);
               return { valid: false, status: SubscriptionStatus.PENDING };
          }

          const startDateMs = parseInt(latest.purchase_date_ms, 10);
          const startedAt = new Date(startDateMs);

          const expiresDateMs = parseInt(latest.expires_date_ms, 10);
          const expiresAt = new Date(expiresDateMs);

          let status: SubscriptionStatus = SubscriptionStatus.PENDING;
          if (Date.now() < expiresDateMs) {
               status = SubscriptionStatus.ACTIVE;
          } else {
               status = SubscriptionStatus.EXPIRED;
          }

          return {
               valid: true,
               startedAt,
               expiresAt,
               status,
               transactionId: latest.transaction_id, // unique per transaction
               originalTransactionId: latest.original_transaction_id, // stable across renewals
          };
     } catch (error: any) {
          console.error('Apple verification failed:', error.response?.data || error.message);
          return { valid: false, status: SubscriptionStatus.PENDING };
     }
}
