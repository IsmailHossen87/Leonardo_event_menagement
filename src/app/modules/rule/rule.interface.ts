import { Model } from 'mongoose';

export enum EPermissionType {
     IS_EMAIL_NOTIFICATIONS = 'is-email-notifications',
     IS_APP_NOTIFICATIONS = 'is-app-notifications',
     IS_AUTO_APPROVE_EVENTS = 'is-auto-approve-events',
     IS_VISIBILITY_PUBLIC = 'is-visibility-public',
     IS_EXPIRED_EVENTS_AUTO_LOCK = 'is-expired-events-auto-lock',
     AUTO_REFUND_EVENTS = 'auto-refund-events',
}

export enum EValuesTypes {
     ALLOWED_INVOICES_COUNT_FOR_FREE_USERS = 'allowedInvoicesCountForFreeUsers',
     DEFAULT_VAT = 'defaultVat',
}

export enum EContentType {
     privacy = 'privacy',
     terms = 'terms',
     about = 'about',
     appExplain = 'appExplain',
     support = 'support',
     socialMedia = 'socialMedia',
}


export type IRule = {
     content:
     | string
     | {
          facebook: string;
          twitter: string;
          instagram: string;
          linkedin: string;
          whatsapp: string;
     };
     type: EContentType;
     permission: boolean;
     permissionType: EPermissionType;
     value: number;
     valuesTypes: EValuesTypes;
};

export type RuleModel = Model<IRule, Record<string, unknown>>;
