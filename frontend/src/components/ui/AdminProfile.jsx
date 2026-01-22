zimport React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { toast } from 'sonner';
import { useAuth } from '../../App';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8081';

const AdminProfile = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${BACKEND_URL}/api/auth/change-password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      toast.success('Password updated successfully');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Current password is incorrect');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="bg-gray-50" />
          </div>
          <div>
            <Label>Name</Label>
            <Input value={user?.name || ''} disabled className="bg-gray-50" />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={user?.role || ''} disabled className="bg-gray-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label>Current Password *</Label>
              <Input
                type="password"
                required
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label>New Password *</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label>Confirm New Password *</Label>
              <Input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-[#8B1538] hover:bg-[#6B0F2A]"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;