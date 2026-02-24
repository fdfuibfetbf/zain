/**
 * Base interfaces for WHMCS API responses.
 */

export interface WhmcsBaseResponse {
    result: 'success' | 'error';
    message?: string;
    totalresults?: string | number;
    startnumber?: number;
    numreturned?: number;
}

// --- CLIENT MODELS ---

export interface WhmcsClient {
    id: number;
    firstname: string;
    lastname: string;
    fullname: string;
    companyname: string;
    email: string;
    address1: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phonenumber: string;
    groupid: number;
    status: string;
    datecreated: string;
}

// --- BILLING MODELS ---

export interface WhmcsInvoice {
    id: number;
    userid: number;
    invoicenum: string;
    date: string;
    duedate: string;
    datepaid: string;
    lastcaptureattempt: string;
    subtotal: string;
    credit: string;
    tax: string;
    total: string;
    balance: string;
    status: 'Unpaid' | 'Paid' | 'Cancelled' | 'Refunded' | 'Collections';
    paymentmethod: string;
}

export interface WhmcsTransaction {
    id: number;
    userid: number;
    currency: string;
    gateway: string;
    date: string;
    description: string;
    amountin: string;
    fees: string;
    amountout: string;
    transid: string;
    invoiceid: number;
}

// --- PRODUCT/SERVICE MODELS ---

export interface WhmcsProduct {
    id: number;
    gid: number;
    type: string;
    name: string;
    description: string;
    module: string;
    paytype: string;
    pricing: any;
}

export interface WhmcsService {
    id: number;
    userid: number;
    orderid: number;
    pid: number;
    regdate: string;
    name: string;
    domain: string;
    status: 'Pending' | 'Active' | 'Completed' | 'Suspended' | 'Terminated' | 'Cancelled' | 'Fraud';
    nextduedate: string;
    billingcycle: string;
    amount: string;
    customfields: {
        customfield: Array<{
            id: number;
            name: string;
            value: string;
        }>;
    };
}

// --- ORDER MODELS ---

export interface WhmcsOrder {
    id: number;
    ordernum: string;
    userid: number;
    contactid: number;
    date: string;
    nameservers: string;
    transfersecret: string;
    renewals: string;
    promocode: string;
    promotype: string;
    promovalue: string;
    orderdata: string;
    amount: string;
    paymentmethod: string;
    invoiceid: number;
    status: string;
}

export interface WhmcsAcceptOrderParams {
    orderid: number;
    serverid?: number;
    serviceusername?: string;
    servicepassword?: string;
    registrar?: string;
    sendregistrar?: boolean;
    autosetup?: boolean;
    sendemail?: boolean;
}

// --- SUPPORT MODELS ---

export interface WhmcsTicket {
    id: number;
    tid: string;
    deptid: number;
    userid: number;
    name: string;
    email: string;
    cc: string;
    c: string;
    date: string;
    subject: string;
    message: string;
    status: string;
    priority: string;
    lastreply: string;
}

// --- DOMAIN MODELS ---

export interface WhmcsDomain {
    id: number;
    userid: number;
    orderid: number;
    registrationdate: string;
    domain: string;
    firstpaymentamount: string;
    recurringamount: string;
    registrar: string;
    registrationperiod: number;
    expirydate: string;
    subscriptionid: string;
    status: string;
    nextduedate: string;
}

// --- USER MODELS ---

export interface WhmcsUser {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    date_created: string;
    last_login: string;
}
