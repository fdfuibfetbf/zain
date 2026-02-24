'use client';

import { motion } from 'framer-motion';
import { Sparkles, Home, Image, Wand2, TrendingUp, QrCode, FileText, Palette } from 'lucide-react';

const aiTools = [
  {
    icon: Image,
    name: 'Image generator',
    description: 'Create unique graphics and visuals tailored to the needs of your brand.',
  },
  {
    icon: Wand2,
    name: 'Background remover',
    description: 'Remove the background of any image to get that professional look.',
  },
  {
    icon: TrendingUp,
    name: 'Image upscaler',
    description: 'Upload an image that you want to enhance.',
  },
  {
    icon: TrendingUp,
    name: 'Attention heatmap',
    description: 'Visualize user behavior to optimize engagement and increase conversions.',
  },
  {
    icon: QrCode,
    name: 'QR generator',
    description: 'Generate QR codes instantly from URL, text, and more.',
  },
  {
    icon: FileText,
    name: 'Content generator',
    description: 'Create engaging posts, email, or social media content with AI.',
  },
  {
    icon: Palette,
    name: 'Logo Maker',
    description: 'Design a professional and eye-catching logo for your brand in a matter of minutes.',
  },
];

export default function AIToolsPage() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
        <Home className="w-4 h-4" />
        <span>-</span>
        <span>AI tools</span>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Hostinger AI tools</h1>
        <p className="text-[var(--foreground-muted)] mt-2">
          Enhance your online presence with these cutting-edge AI tools.
        </p>
      </div>

      {/* AI Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {aiTools.map((tool, idx) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{tool.name}</h3>
              <p className="text-sm text-[var(--foreground-muted)] mb-4">{tool.description}</p>
              <button className="btn btn-secondary w-full border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5">
                Try now
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
