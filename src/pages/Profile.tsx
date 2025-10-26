import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, FileText } from 'lucide-react';
import type { KYCDocument } from '../types';
import { formatApiError } from '../utils/errorHandler';

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [showKYCForm, setShowKYCForm] = useState(false);
  const [kycData, setKycData] = useState({
    document_type: 'pan' as const,
    document_number: '',
    file: null as File | null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const data = await authApi.getKYCStatus();
      setKycDocuments(data.documents);
    } catch (error) {
      console.error('Failed to load KYC status:', error);
    }
  };

  const handleUploadKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!kycData.file) {
        setError('Please select a file to upload');
        return;
      }

      const formData = new FormData();
      formData.append('document_type', kycData.document_type);
      formData.append('document_number', kycData.document_number);
      formData.append('file', kycData.file);

      await authApi.uploadKYC(formData);
      setSuccess('KYC document uploaded successfully!');
      setShowKYCForm(false);
      setKycData({ document_type: 'pan', document_number: '', file: null });
      loadKYCStatus();
      refreshUser();
    } catch (err: any) {
      setError(formatApiError(err) || 'Upload failed');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile & KYC</h1>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* User Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="text-primary-600" size={24} />
              <CardTitle>User Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-mono text-sm text-gray-700">{user?.user_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium text-gray-900 capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">KYC Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  user?.kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
                  user?.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  user?.kyc_status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {user?.kyc_status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC Documents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="text-primary-600" size={24} />
                <CardTitle>KYC Documents</CardTitle>
              </div>
              {user?.kyc_status !== 'verified' && (
                <Button size="sm" onClick={() => setShowKYCForm(!showKYCForm)}>
                  Upload Document
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showKYCForm && (
              <form onSubmit={handleUploadKYC} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    value={kycData.document_type}
                    onChange={(e) => setKycData({ ...kycData, document_type: e.target.value as any })}
                  >
                    <option value="pan">PAN Card</option>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                  </select>
                </div>

                <Input
                  label="Document Number"
                  value={kycData.document_number}
                  onChange={(e) => setKycData({ ...kycData, document_number: e.target.value })}
                  placeholder="Enter document number"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setKycData({ ...kycData, file: e.target.files?.[0] || null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit">Upload</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowKYCForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {kycDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No KYC documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {kycDocuments.map((doc) => (
                  <div key={doc.document_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{doc.document_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600 font-mono">{doc.document_number}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      doc.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
