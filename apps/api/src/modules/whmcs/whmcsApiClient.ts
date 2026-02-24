import axios, { AxiosInstance } from 'axios';
import * as Types from './types.js';

export class WhmcsApiClient {
    private api: AxiosInstance;

    constructor(baseUrl: string, identifier: string, secret: string, accessKey?: string) {
        this.api = axios.create({
            baseURL: baseUrl.endsWith('/') ? baseUrl + 'includes/api.php' : baseUrl + '/includes/api.php',
            params: {
                username: identifier,
                password: secret,
                accesskey: accessKey,
                responsetype: 'json',
            },
        });
    }

    private async post<T>(action: string, data: any = {}): Promise<T & Types.WhmcsBaseResponse> {
        const response = await this.api.post('', null, {
            params: { action, ...data },
        });
        return response.data;
    }

    // --- ORDERS ---
    async getOrders(params: any = {}) { return this.post<any>('GetOrders', params); }
    async addOrder(params: any) { return this.post<any>('AddOrder', params); }
    async acceptOrder(params: { orderid: number }) { return this.post<any>('AcceptOrder', params); }
    async cancelOrder(params: { orderid: number }) { return this.post<any>('CancelOrder', params); }
    async deleteOrder(params: { orderid: number }) { return this.post<any>('DeleteOrder', params); }
    async getOrderStatuses() { return this.post<any>('GetOrderStatuses'); }

    // --- BILLING ---
    async getInvoices(params: any = {}) { return this.post<any>('GetInvoices', params); }
    async getInvoice(params: { invoiceid: number }) { return this.post<any>('GetInvoice', params); }
    async createInvoice(params: any) { return this.post<any>('CreateInvoice', params); }
    async updateInvoice(params: any) { return this.post<any>('UpdateInvoice', params); }
    async addInvoicePayment(params: any) { return this.post<any>('AddInvoicePayment', params); }
    async getTransactions(params: any = {}) { return this.post<any>('GetTransactions', params); }
    async addTransaction(params: any) { return this.post<any>('AddTransaction', params); }
    async getCurrencies() { return this.post<any>('GetCurrencies'); }

    // --- CLIENTS ---
    async getClients(params: any = {}) { return this.post<any>('GetClients', params); }
    async getClientDetails(params: { clientid?: number; email?: string }) { return this.post<any>('GetClientsDetails', params); }
    async addClient(params: any) { return this.post<any>('AddClient', params); }
    async updateClient(params: any) { return this.post<any>('UpdateClient', params); }
    async deleteClient(params: { clientid: number }) { return this.post<any>('DeleteClient', params); }
    async getClientGroups() { return this.post<any>('GetClientGroups'); }

    // --- PRODUCTS / SERVICES ---
    async getProducts(params: any = {}) { return this.post<any>('GetProducts', params); }
    async getClientsProducts(params: any = {}) { return this.post<any>('GetClientsProducts', params); }
    async updateClientProduct(params: any) { return this.post<any>('UpdateClientProduct', params); }
    async upgradeProduct(params: any) { return this.post<any>('UpgradeProduct', params); }

    // --- MODULE ACTIONS ---
    async moduleCreate(params: { serviceid: number }) { return this.post<any>('ModuleCreate', params); }
    async moduleSuspend(params: { serviceid: number; suspendreason?: string }) { return this.post<any>('ModuleSuspend', params); }
    async moduleUnsuspend(params: { serviceid: number }) { return this.post<any>('ModuleUnsuspend', params); }
    async moduleTerminate(params: { serviceid: number }) { return this.post<any>('ModuleTerminate', params); }
    async moduleChangePackage(params: { serviceid: number }) { return this.post<any>('ModuleChangePackage', params); }
    async moduleCustom(params: { serviceid: number; func_name: string }) { return this.post<any>('ModuleCustom', params); }

    // --- SUPPORT ---
    async getTickets(params: any = {}) { return this.post<any>('GetTickets', params); }
    async getTicket(params: { ticketid: number }) { return this.post<any>('GetTicket', params); }
    async openTicket(params: any) { return this.post<any>('OpenTicket', params); }
    async addTicketReply(params: any) { return this.post<any>('AddTicketReply', params); }
    async getSupportDepartments() { return this.post<any>('GetSupportDepartments'); }
    async getSupportStatuses() { return this.post<any>('GetSupportStatuses'); }

    // --- DOMAINS ---
    async getClientsDomains(params: any = {}) { return this.post<any>('GetClientsDomains', params); }
    async domainRegister(params: { domainid: number }) { return this.post<any>('DomainRegister', params); }
    async domainRenew(params: { domainid: number }) { return this.post<any>('DomainRenew', params); }
    async domainTransfer(params: { domainid: number }) { return this.post<any>('DomainTransfer', params); }
    async domainUpdateNameservers(params: any) { return this.post<any>('DomainUpdateNameservers', params); }

    // --- USERS ---
    async getUsers(params: any = {}) { return this.post<any>('GetUsers', params); }
    async addUser(params: any) { return this.post<any>('AddUser', params); }
    async updateUser(params: any) { return this.post<any>('UpdateUser', params); }
    async validateLogin(params: { email: string; password: string }) { return this.post<any>('ValidateLogin', params); }

    // --- SYSTEM ---
    async getStats() { return this.post<any>('GetStats'); }
    async getActivityLog(params: any = {}) { return this.post<any>('GetActivityLog', params); }
    async logActivity(params: { description: string; clientid?: number }) { return this.post<any>('LogActivity', params); }
    async getConfigurationValue(params: { setting: string }) { return this.post<any>('GetConfigurationValue', params); }
    async setConfigurationValue(params: { setting: string; value: string }) { return this.post<any>('SetConfigurationValue', params); }

    // --- OAUTH ---
    async listOAuthCredentials() { return this.post<any>('ListOAuthCredentials'); }
    async createOAuthCredential(params: any) { return this.post<any>('CreateOAuthCredential', params); }
}
