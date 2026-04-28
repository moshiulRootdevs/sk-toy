'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Button from '@/components/ui/Button';

const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#8B8176',
  textTransform: 'uppercase', letterSpacing: '.07em',
  marginBottom: 4, display: 'block',
};
const inp: React.CSSProperties = {
  border: '1px solid #E8DFD2', borderRadius: 8, padding: '8px 12px',
  fontSize: 13, color: '#2A2420', background: '#FAF6EF',
  outline: 'none', fontFamily: 'inherit', width: '100%',
};

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #F4EEE3' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {children}
      </div>
    </div>
  );
}

function OptionCard({ zoneKey, title, form, onChange }: {
  zoneKey: 'inside' | 'outside';
  title: string;
  form: {
    title: string; description: string;
    amount: string; freeOver: string;
  };
  onChange: (field: string, value: string) => void;
}) {
  return (
    <div style={{ background: '#FAF6EF', borderRadius: 12, border: '1px solid #E8DFD2', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: zoneKey === 'inside' ? '#4FA36A' : '#EC5D4A',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#2A2420' }}>{title}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={lbl}>Label / Title</label>
          <input style={inp} value={form.title} onChange={(e) => onChange('title', e.target.value)}
            placeholder={zoneKey === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'} />
        </div>
        <div>
          <label style={lbl}>Short Description</label>
          <input style={inp} value={form.description} onChange={(e) => onChange('description', e.target.value)}
            placeholder={zoneKey === 'inside' ? 'Delivered within 1–2 business days' : 'Delivered within 3–5 business days'} />
        </div>
        <div>
          <label style={lbl}>Delivery Fee (৳)</label>
          <input style={inp} type="number" min="0" value={form.amount}
            onChange={(e) => onChange('amount', e.target.value)}
            placeholder={zoneKey === 'inside' ? '60' : '120'} />
        </div>
        <div>
          <label style={lbl}>Free Delivery Over (৳)</label>
          <input style={inp} type="number" min="0" value={form.freeOver}
            onChange={(e) => onChange('freeOver', e.target.value)}
            placeholder="e.g. 2500" />
          <div style={{ fontSize: 10, color: '#A89E92', marginTop: 3 }}>Leave blank to disable free delivery</div>
        </div>
      </div>
    </div>
  );
}

export default function ShippingPage() {
  const qc = useQueryClient();

  const { data: settings } = useQuery<any>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
  });

  const [inside, setInside] = useState({ title: '', description: '', amount: '', freeOver: '' });
  const [outside, setOutside] = useState({ title: '', description: '', amount: '', freeOver: '' });
  const [loaded, setLoaded] = useState(false);

  if (settings && !loaded) {
    const id = settings.shipping?.insideDhaka;
    const od = settings.shipping?.outsideDhaka;
    setInside({
      title:       id?.title       || 'Inside Dhaka',
      description: id?.description || 'Delivered within 1–2 business days',
      amount:      String(id?.amount  ?? 60),
      freeOver:    String(id?.freeOver || ''),
    });
    setOutside({
      title:       od?.title       || 'Outside Dhaka',
      description: od?.description || 'Delivered within 3–5 business days',
      amount:      String(od?.amount ?? 120),
      freeOver:    String(od?.freeOver || ''),
    });
    setLoaded(true);
  }

  const setI = (field: string, value: string) => setInside((f) => ({ ...f, [field]: value }));
  const setO = (field: string, value: string) => setOutside((f) => ({ ...f, [field]: value }));

  const saveMutation = useMutation({
    mutationFn: () => api.put('/settings', {
      shipping: {
        insideDhaka: {
          title:       inside.title,
          description: inside.description,
          amount:      Number(inside.amount),
          freeOver:    inside.freeOver ? Number(inside.freeOver) : 0,
        },
        outsideDhaka: {
          title:       outside.title,
          description: outside.description,
          amount:      Number(outside.amount),
          freeOver:    outside.freeOver ? Number(outside.freeOver) : 0,
        },
      },
    }),
    onSuccess: () => { toast.success('Delivery options saved!'); qc.invalidateQueries({ queryKey: ['settings'] }); },
    onError: () => toast.error('Save failed'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>Shipping</h1>
          <p style={{ fontSize: 12, color: '#8B8176', marginTop: 3 }}>
            Configure delivery options shown to customers at checkout.
          </p>
        </div>
        <Button size="md" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
          Save Delivery Options
        </Button>
      </div>

      <Section
        title="Delivery Options"
        subtitle="Both options appear as selectable cards on the checkout page. Amounts and labels are fully customisable."
      >
        <OptionCard zoneKey="inside"  title="Inside Dhaka"  form={inside}  onChange={setI} />
        <OptionCard zoneKey="outside" title="Outside Dhaka" form={outside} onChange={setO} />
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="md" onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
          Save Delivery Options
        </Button>
      </div>
    </div>
  );
}
