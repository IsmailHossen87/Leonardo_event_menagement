import express from 'express';
import { UserRouter } from '../app/modules/user/user.route';
import { AuthRouter } from '../app/modules/auth/auth.route';
import SettingsRouter from '../app/modules/settings/settings.route';
import { HistoryTrackerRoutes } from '../app/modules/HistoryTracker/HistoryTracker.route';
import { RuleRoute } from '../app/modules/rule/rule.route';
import { WebsiteLogoRoutes } from '../app/modules/websiteLogo/websiteLogo.route';
import { PackageRoutes } from '../app/modules/package/package.route';
import { subscriptionRoutes } from '../app/modules/subscription/subscription.route';
import { EventRoutes } from '../app/modules/Event/Event.route';
import { AdminRoutes } from '../app/modules/admin/admin.route';
import { EvenRegistrationRoutes } from '../app/modules/EvenRegistration/EvenRegistration.route';
import { chatRoutes } from '../app/modules/chat/chat.route';
import { messageRoutes } from '../app/modules/message/message.route';
import { dashboardRouter } from '../app/modules/dashboard/dashboard.router';
import { StatusRouter } from '../app/modules/status/status.router';
import { NewsFeedRoutes } from '../app/modules/feeds/feed.route';
import { RefundRoutes } from '../app/modules/refund/refund.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';

const router = express.Router();
const routes = [
     {
          path: '/auth',
          route: AuthRouter,
     },
     {
          path: '/users',
          route: UserRouter,
     },
     {
          path: '/settings',
          route: SettingsRouter,
     },
     {
          path: '/history-tracker',
          route: HistoryTrackerRoutes,
     },
     {
          path: '/rules',
          route: RuleRoute,
     },
     {
          path: '/website-logo',
          route: WebsiteLogoRoutes,
     },
     {
          path: '/packages',
          route: PackageRoutes,
     },
     {
          path: '/subscriptions',
          route: subscriptionRoutes,
     },
     {
          path: '/faq',
          route: FaqRoutes,
     },
     {
          path: '/events',
          route: EventRoutes,
     },
     {
          path: '/admins',
          route: AdminRoutes,
     },
     {
          path: '/registations',
          route: EvenRegistrationRoutes,
     },
     {
          path: '/chat',
          route: chatRoutes,
     },
     {
          path: '/messege',
          route: messageRoutes,
     },
     {
          path: '/dashboard',
          route: dashboardRouter,
     },
     {
          path: '/status',
          route: StatusRouter,
     },
     {
          path: '/news-feed',
          route: NewsFeedRoutes,
     },
     {
          path: '/refunds',
          route: RefundRoutes,
     }
];

routes.forEach((element) => {
     if (element?.path && element?.route) {
          router.use(element?.path, element?.route);
     }
});

export default router;
