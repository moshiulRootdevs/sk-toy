'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const card: React.CSSProperties = {
  background: '#FFF', borderRadius: 12, border: '1px solid #E8DFD2', overflow: 'hidden',
};
const cardHeader: React.CSSProperties = {
  padding: '14px 20px 12px', borderBottom: '1px solid #F4EEE3',
};
const cardBody: React.CSSProperties = {
  padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16,
};

export default function ProfilePage() {
  const { adminUser, updateAdminUser } = useAuthStore();

  const [name, setName] = useState(adminUser?.name || '');
  const [email, setEmail] = useState(adminUser?.email || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const profileMutation = useMutation({
    mutationFn: () => api.put('/auth/admin/profile', { name }),
    onSuccess: (res) => {
      toast.success('Profile updated!');
      updateAdminUser(res.data.user);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => api.put('/auth/admin/password', { currentPassword, newPassword }),
    onSuccess: () => {
      toast.success('Password changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  function handlePasswordSubmit() {
    if (!currentPassword) { toast.error('Enter your current password'); return; }
    if (!newPassword) { toast.error('Enter a new password'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    passwordMutation.mutate();
  }

  const initials = adminUser?.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#2A2420', margin: 0 }}>My Profile</h1>
        <p style={{ fontSize: 12, color: '#8B8176', marginTop: 3 }}>Update your account details and password.</p>
      </div>

      {/* Avatar + info */}
      <div style={{ ...card }}>
        <div style={{ ...cardBody, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #F5C443 0%, #F39436 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#1F2F4A', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(245,196,67,.3)',
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#2A2420' }}>{adminUser?.name}</div>
            <div style={{ fontSize: 13, color: '#8B8176', marginTop: 2 }}>{adminUser?.email}</div>
            <div style={{
              display: 'inline-block', marginTop: 6,
              fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: '#D8EBDC', color: '#2D7A4A',
              textTransform: 'uppercase', letterSpacing: '.06em',
            }}>
              {adminUser?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div style={card}>
        <div style={cardHeader}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>Profile Information</div>
          <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>Update your display name.</div>
        </div>
        <div style={cardBody}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#8B8176', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 4, display: 'block' }}>Email Address</label>
              <div style={{ border: '1px solid #E8DFD2', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#A89E92', background: '#F4EEE3', cursor: 'not-allowed' }}>
                {email}
              </div>
              <div style={{ fontSize: 11, color: '#A89E92', marginTop: 4 }}>Email cannot be changed</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="md" onClick={() => profileMutation.mutate()} loading={profileMutation.isPending}>
              Save Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div style={card}>
        <div style={cardHeader}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#2A2420' }}>Change Password</div>
          <div style={{ fontSize: 11, color: '#8B8176', marginTop: 2 }}>Use a strong password with at least 6 characters.</div>
        </div>
        <div style={cardBody}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            <div />
            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
            <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <div style={{ fontSize: 12, color: '#EC5D4A' }}>Passwords do not match</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="md" onClick={handlePasswordSubmit} loading={passwordMutation.isPending}>
              Change Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
