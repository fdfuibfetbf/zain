'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Globe,
  Server,
  Lock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Settings,
  FileText,
  Layers,
  Zap,
} from 'lucide-react';

type HttpsOption = 'unencrypted' | 'aber-dorsa' | 'dorsa-cloud' | 'dorsa-main';
type HstsEnabled = boolean;
type HttpRedirect = boolean;

export default function CDNDNSPage() {
  const [activeTab, setActiveTab] = useState<'https' | 'hsts' | 'certificates' | 'dns'>('https');
  const [httpsOption, setHttpsOption] = useState<HttpsOption>('dorsa-cloud');
  const [hstsEnabled, setHstsEnabled] = useState<HstsEnabled>(true);
  const [httpRedirect, setHttpRedirect] = useState<HttpRedirect>(true);

  const tabs = [
    { id: 'https', label: 'HTTPS Settings', icon: Lock },
    { id: 'hsts', label: 'HSTS activation', icon: Shield },
    { id: 'certificates', label: 'Edge certificates (Dorsa)', icon: FileText },
    { id: 'dns', label: 'DNS Records', icon: Globe },
  ];

  const httpsOptions = [
    {
      id: 'unencrypted',
      title: 'HTTP - Unencrypted',
      description: "The visitor's communication protocol with Dorsa's servers will be non-encrypted.",
      color: 'text-[var(--error)]',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      id: 'aber-dorsa',
      title: 'HTTPS encryption with Aber Dorsa',
      description: "The visitor's communication protocol with Dorsa's servers is encrypted by TLS.",
      color: 'text-[var(--foreground)]',
      bgColor: 'bg-white',
      borderColor: 'border-[var(--border-default)]',
    },
    {
      id: 'dorsa-cloud',
      title: 'HTTPS encryption with Dorsa cloud and main server',
      description: "The visitor's communication protocol with Dorsa's servers is encrypted by TLS.",
      color: 'text-[var(--foreground)]',
      bgColor: 'bg-white',
      borderColor: 'border-[var(--border-default)]',
      recommended: true,
    },
    {
      id: 'dorsa-main',
      title: 'HTTPS encryption with Dorsa cloud and main user servers',
      description: "The visitor's communication protocol with Dorsa's servers is encrypted by TLS. The visitor's communication protocol between Aber Dorsa and your users.",
      color: 'text-[var(--foreground)]',
      bgColor: 'bg-white',
      borderColor: 'border-[var(--border-default)]',
    },
  ];

  const quickSettings = [
    { label: 'SSL/TLS Setting', active: true },
    { label: 'DNS Record Setting', active: false },
    { label: 'API Gateway Setting', active: false },
    { label: 'Load Balance Setting', active: false },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">CDN / DNS</h1>
          <p className="text-[var(--foreground-muted)] mt-1">
            Content management and delivery settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="btn btn-primary">
            <Settings className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </motion.div>

      {/* Quick Settings Pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3"
      >
        {quickSettings.map((setting) => (
          <button
            key={setting.label}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              setting.active
                ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-blue-500/20'
                : 'bg-[var(--surface-2)] text-[var(--foreground-muted)] hover:bg-[var(--surface-3)]'
            }`}
          >
            {setting.label}
          </button>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Settings Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--sidebar-item-active)] text-[var(--accent-primary)]'
                    : 'text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-3 space-y-6"
        >
          {/* HTTPS Settings */}
          {activeTab === 'https' && (
            <div className="settings-section">
              <div className="settings-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <h2 className="settings-title">HTTPS settings</h2>
                    <p className="settings-description">
                      Visitor communication protocol with Dorsa servers and main user servers
                    </p>
                  </div>
                </div>
              </div>
              <div className="settings-body">
                <p className="text-sm text-[var(--foreground-muted)] mb-6">
                  By setting this option, you can specify the communication method between Aber Dorsa servers and your users.
                </p>
                
                <div className="radio-group">
                  {httpsOptions.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setHttpsOption(option.id as HttpsOption)}
                      className={`radio-item ${httpsOption === option.id ? 'selected' : ''}`}
                    >
                      <div className="radio-circle">
                        <div className="radio-circle-inner"></div>
                      </div>
                      <div className="radio-content">
                        <div className="flex items-center gap-2">
                          <span className={`radio-label ${option.color}`}>{option.title}</span>
                          {option.recommended && (
                            <span className="badge badge-success text-xs">Recommended</span>
                          )}
                        </div>
                        <p className="radio-description">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HSTS Settings */}
          {activeTab === 'hsts' && (
            <div className="space-y-6">
              <div className="settings-section">
                <div className="settings-header">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--success-soft)] flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[var(--success)]" />
                    </div>
                    <div>
                      <h2 className="settings-title">HSTS activation</h2>
                      <p className="settings-description">
                        HTTP Strict Transport Security (HSTS) enforce web security policy for your website
                      </p>
                    </div>
                  </div>
                </div>
                <div className="settings-body">
                  <div className="p-4 rounded-xl bg-[var(--surface-2)] mb-6">
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Policy: Max-Age: 30 days, Include subdomains: On, Preload: On
                    </p>
                  </div>
                  
                  <div className="settings-row">
                    <div>
                      <p className="settings-label">Enable HSTS</p>
                      <p className="settings-sublabel">Force HTTPS for all connections</p>
                    </div>
                    <div
                      className={`toggle ${hstsEnabled ? 'active' : ''}`}
                      onClick={() => setHstsEnabled(!hstsEnabled)}
                    >
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                  
                  <div className="settings-row">
                    <div>
                      <p className="settings-label">Include Subdomains</p>
                      <p className="settings-sublabel">Apply HSTS to all subdomains</p>
                    </div>
                    <div className="toggle active">
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                  
                  <div className="settings-row">
                    <div>
                      <p className="settings-label">Preload</p>
                      <p className="settings-sublabel">Include in browser preload lists</p>
                    </div>
                    <div className="toggle active">
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <div className="settings-header">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <h2 className="settings-title">Enable conversion of Http links to Https</h2>
                      <p className="settings-description">
                        Automatic HTTPS Rewrites helps fix mixed content by changing &quot;http&quot; to &quot;https&quot;
                      </p>
                    </div>
                  </div>
                </div>
                <div className="settings-body">
                  <div className="settings-row">
                    <div>
                      <p className="settings-label">Auto HTTPS Redirect</p>
                      <p className="settings-sublabel">
                        Automatic HTTPS Rewrites helps fix mixed content by changing all resources or links on your web site that can be served with HTTPS.
                      </p>
                    </div>
                    <div
                      className={`toggle ${httpRedirect ? 'active' : ''}`}
                      onClick={() => setHttpRedirect(!httpRedirect)}
                    >
                      <div className="toggle-knob"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Certificates */}
          {activeTab === 'certificates' && (
            <div className="settings-section">
              <div className="settings-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--warning-soft)] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[var(--warning)]" />
                  </div>
                  <div>
                    <h2 className="settings-title">Edge certificates (Dorsa)</h2>
                    <p className="settings-description">
                      Manage your SSL/TLS certificates
                    </p>
                  </div>
                </div>
              </div>
              <div className="settings-body">
                <div className="grid gap-4">
                  {[
                    { domain: '*.example.com', status: 'Active', expires: '2025-12-15', type: 'Universal' },
                    { domain: 'api.example.com', status: 'Active', expires: '2025-11-20', type: 'Custom' },
                    { domain: 'cdn.example.com', status: 'Pending', expires: '-', type: 'Universal' },
                  ].map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          cert.status === 'Active' ? 'bg-[var(--success-soft)]' : 'bg-[var(--warning-soft)]'
                        }`}>
                          {cert.status === 'Active' ? (
                            <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-[var(--warning)]" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{cert.domain}</p>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {cert.type} Certificate • Expires: {cert.expires}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${cert.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                          <span className="badge-dot"></span>
                          {cert.status}
                        </span>
                        <button className="btn btn-ghost btn-sm">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="btn btn-primary w-full mt-6">
                  <Layers className="w-4 h-4" />
                  Add New Certificate
                </button>
              </div>
            </div>
          )}

          {/* DNS Records */}
          {activeTab === 'dns' && (
            <div className="settings-section">
              <div className="settings-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--info-soft)] flex items-center justify-center">
                      <Globe className="w-5 h-5 text-[var(--accent-primary)]" />
                    </div>
                    <div>
                      <h2 className="settings-title">DNS Record Settings</h2>
                      <p className="settings-description">
                        Manage your domain DNS records
                      </p>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm">
                    <Zap className="w-4 h-4" />
                    Add Record
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Content</th>
                      <th>TTL</th>
                      <th>Proxy</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: 'A', name: '@', content: '192.168.1.1', ttl: 'Auto', proxy: true },
                      { type: 'CNAME', name: 'www', content: 'example.com', ttl: 'Auto', proxy: true },
                      { type: 'MX', name: '@', content: 'mail.example.com', ttl: '1h', proxy: false },
                      { type: 'TXT', name: '@', content: 'v=spf1 include...', ttl: 'Auto', proxy: false },
                    ].map((record, index) => (
                      <tr key={index}>
                        <td>
                          <span className="px-2 py-1 rounded text-xs font-mono font-medium bg-[var(--surface-2)]">
                            {record.type}
                          </span>
                        </td>
                        <td className="font-mono text-sm">{record.name}</td>
                        <td className="font-mono text-sm text-[var(--foreground-muted)] max-w-[200px] truncate">
                          {record.content}
                        </td>
                        <td className="text-[var(--foreground-muted)]">{record.ttl}</td>
                        <td>
                          <div className={`toggle ${record.proxy ? 'active' : ''}`}>
                            <div className="toggle-knob"></div>
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm">
                            <Settings className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

