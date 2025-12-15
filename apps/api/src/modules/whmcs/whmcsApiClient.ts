export type WhmcsApiResult<T> =
  | ({ result: 'success' } & T)
  | { result: 'error'; message?: string };

export type WhmcsConnectionConfig = {
  baseUrl: string;
  apiIdentifier: string;
  apiSecret: string;
};

export class WhmcsApiClient {
  constructor(private readonly cfg: WhmcsConnectionConfig) {}

  private apiUrl() {
    const base = this.cfg.baseUrl.replace(/\/+$/, '');
    return `${base}/includes/api.php`;
  }

  async request<T>(action: string, params: Record<string, string>): Promise<WhmcsApiResult<T>> {
    const body = new URLSearchParams({
      action,
      responsetype: 'json',
      identifier: this.cfg.apiIdentifier,
      secret: this.cfg.apiSecret,
      ...params,
    });

    const res = await fetch(this.apiUrl(), {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!res.ok) {
      throw new Error(`WHMCS API HTTP ${res.status}`);
    }

    const json = (await res.json()) as WhmcsApiResult<T>;
    return json;
  }

  async validateLogin(args: { email: string; password: string }) {
    // WHMCS ValidateLogin uses `email` + `password2` (per WHMCS API convention).
    return this.request<{ userid: string }>('ValidateLogin', {
      email: args.email,
      password2: args.password,
    });
  }

  async getClientDetails(args: { clientId: number }) {
    return this.request<{ client: { id: string; groupid?: string } }>('GetClientsDetails', {
      clientid: String(args.clientId),
      stats: 'false',
    });
  }

  async updateClientProductDedicatedIp(args: { serviceId: number; ip: string }) {
    return this.request<Record<string, unknown>>('UpdateClientProduct', {
      serviceid: String(args.serviceId),
      dedicatedip: args.ip,
    });
  }

  async getClientsProducts(args: { clientId: number }) {
    return this.request<{ products?: { product?: any[] } }>('GetClientsProducts', {
      clientid: String(args.clientId),
    });
  }

  async getOrders(args?: { limitstart?: number; limitnum?: number; status?: string }) {
    const params: Record<string, string> = {};
    if (args?.limitstart !== undefined) params.limitstart = String(args.limitstart);
    if (args?.limitnum !== undefined) params.limitnum = String(args.limitnum);
    if (args?.status) params.status = args.status;
    return this.request<{ orders?: { order?: any[] }; totalresults?: string }>('GetOrders', params);
  }

  async getClients(args?: { limitstart?: number; limitnum?: number; search?: string }) {
    const params: Record<string, string> = {};
    if (args?.limitstart !== undefined) params.limitstart = String(args.limitstart);
    if (args?.limitnum !== undefined) params.limitnum = String(args.limitnum);
    if (args?.search) params.search = args.search;
    return this.request<{ clients?: { client?: any[] }; totalresults?: string }>('GetClients', params);
  }

  async getAllServices(args?: { limitstart?: number; limitnum?: number; status?: string }) {
    const params: Record<string, string> = {};
    if (args?.limitstart !== undefined) params.limitstart = String(args.limitstart);
    if (args?.limitnum !== undefined) params.limitnum = String(args.limitnum);
    if (args?.status) params.status = args.status;
    return this.request<{ services?: { service?: any[] }; totalresults?: string }>('GetServices', params);
  }

  async getInvoices(args?: { limitstart?: number; limitnum?: number; status?: string }) {
    const params: Record<string, string> = {};
    if (args?.limitstart !== undefined) params.limitstart = String(args.limitstart);
    if (args?.limitnum !== undefined) params.limitnum = String(args.limitnum);
    if (args?.status) params.status = args.status;
    return this.request<{ invoices?: { invoice?: any[] }; totalresults?: string }>('GetInvoices', params);
  }

  async getProducts(args?: { limitstart?: number; limitnum?: number; gid?: number }) {
    const params: Record<string, string> = {};
    if (args?.limitstart !== undefined) params.limitstart = String(args.limitstart);
    if (args?.limitnum !== undefined) params.limitnum = String(args.limitnum);
    if (args?.gid !== undefined) params.gid = String(args.gid);
    return this.request<{ products?: { product?: any[] }; totalresults?: string }>('GetProducts', params);
  }

  async getDomains(args?: { limitstart?: number; limitnum?: number; clientid?: number; status?: string }) {
    const params: Record<string, string> = {};
    if (args?.limitstart !== undefined) params.limitstart = String(args.limitstart);
    if (args?.limitnum !== undefined) params.limitnum = String(args.limitnum);
    if (args?.clientid !== undefined) params.clientid = String(args.clientid);
    if (args?.status) params.status = args.status;
    return this.request<{ domains?: { domain?: any[] }; totalresults?: string }>('GetClientsDomains', params);
  }

  async getTickets(args?: { limitstart?: number; limitnum?: number; status?: string; deptid?: number }) {
    const params: Record<string, string> = {};
    if (args?.limitstart !== undefined) params.limitstart = String(args.limitstart);
    if (args?.limitnum !== undefined) params.limitnum = String(args.limitnum);
    if (args?.status) params.status = args.status;
    if (args?.deptid !== undefined) params.deptid = String(args.deptid);
    return this.request<{ tickets?: { ticket?: any[] }; totalresults?: string }>('GetTickets', params);
  }

  async getTransactions(args?: { limitstart?: number; limitnum?: number; status?: string }) {
    const params: Record<string, string> = {};
    if (args?.limitstart !== undefined) params.limitstart = String(args.limitstart);
    if (args?.limitnum !== undefined) params.limitnum = String(args.limitnum);
    if (args?.status) params.status = args.status;
    return this.request<{ transactions?: { transaction?: any[] }; totalresults?: string }>('GetTransactions', params);
  }

  async getCurrencies() {
    return this.request<{ currencies?: { currency?: any[] } }>('GetCurrencies', {});
  }

  async getPaymentMethods() {
    return this.request<{ paymentmethods?: { paymentmethod?: any[] } }>('GetPaymentMethods', {});
  }

  async addClient(args: {
    firstname: string;
    lastname: string;
    email: string;
    password2: string;
    phonenumber?: string;
    companyname?: string;
    address1?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  }) {
    const params: Record<string, string> = {
      firstname: args.firstname,
      lastname: args.lastname,
      email: args.email,
      password2: args.password2,
    };
    if (args.phonenumber) params.phonenumber = args.phonenumber;
    if (args.companyname) params.companyname = args.companyname;
    if (args.address1) params.address1 = args.address1;
    if (args.city) params.city = args.city;
    if (args.state) params.state = args.state;
    if (args.postcode) params.postcode = args.postcode;
    if (args.country) params.country = args.country;
    
    return this.request<{ clientid: string }>('AddClient', params);
  }
}


