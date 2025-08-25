import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clientService } from '../services/clientService';
import { authService } from '../services/authService';

const CreateClient = ({ onClientCreated }) => {
  const navigate = useNavigate();
  const [clientType, setClientType] = useState('person');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Person fields
    name: '',
    spouse_name: '',
    filing_details: '',
    ssn: '',
    spouse_ssn: '',
    date_birth: '',
    spouse_date_birth: '',
    
    // Company fields
    business_name: '',
    dba: '',
    contact_name: '',
    ein: '',
    incorporation_date: '',
    incorporation_state: '',
    industry: '',

    // Common fields
    filing_status: '',
    email: '',
    secondary_email: '',
    phone: '',
    additional_phones: '',
    address: '',
    city: '',
    country: '',
    sales_rep: '',
    manager: '',
    language: '',
    
    // Ownership fields
    primary_owner: '',
    department: '',
    account_manager: '',
    relationship_type: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (clientType === 'person') {
      if (!formData.name) {
        toast.error('Name is required for persons');
        return false;
      }
      if (!formData.filing_status) {
        toast.error('Filing status is required');
        return false;
      }
      if (!formData.filing_details) {
        toast.error('Filing details are required');
        return false;
      }
      if (!formData.email) {
        toast.error('Email is required');
        return false;
      }
      if (!formData.phone) {
        toast.error('Phone number is required');
        return false;
      }
      if (!formData.ssn) {
        toast.error('SSN is required');
        return false;
      }
      if (!formData.date_birth) {
        toast.error('Date of birth is required');
        return false;
      }
    } else {
      if (!formData.business_name) {
        toast.error('Business name is required');
        return false;
      }
      if (!formData.contact_name) {
        toast.error('Contact name is required');
        return false;
      }
      if (!formData.filing_status) {
        toast.error('Filing status is required');
        return false;
      }
      if (!formData.email) {
        toast.error('Email is required');
        return false;
      }
      if (!formData.phone) {
        toast.error('Phone number is required');
        return false;
      }
      if (!formData.ein) {
        toast.error('EIN is required');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const user = authService.getUser();
      
      // Prepare client data based on type
      const clientData = {
        type: clientType,
        data: clientType === 'person' ? {
          name: formData.name,
          spouse_name: formData.spouse_name || null,
          filing_status: formData.filing_status,
          filing_details: formData.filing_details,
          email: formData.email,
          secondary_email: formData.secondary_email || null,
          phone: formData.phone || null,
          additional_phones: formData.additional_phones || null,
          address: formData.address || null,
          city: formData.city || null,
          country: formData.country || null,
          ssn: formData.ssn,
          spouse_ssn: formData.spouse_ssn || null,
          date_birth: formData.date_birth,
          spouse_date_birth: formData.spouse_date_birth || null,
          sales_rep: formData.sales_rep || null,
          manager: formData.manager || null,
          language: formData.language || null
        } : {
          business_name: formData.business_name,
          dba: formData.dba || null,
          contact_name: formData.contact_name,
          filing_status: formData.filing_status,
          email: formData.email,
          secondary_email: formData.secondary_email || null,
          phone: formData.phone || null,
          additional_phones: formData.additional_phones || null,
          address: formData.address || null,
          city: formData.city || null,
          country: formData.country || null,
          ein: formData.ein,
          incorporation_date: formData.incorporation_date || null,
          incorporation_state: formData.incorporation_state || null,
          industry: formData.industry || null,
          sales_rep: formData.sales_rep || null,
          manager: formData.manager || null,
          language: formData.language || null
        },
        ownership: {
          primary_owner: formData.primary_owner,
          secondary_owners: [],
          department: formData.department || null,
          account_manager: formData.account_manager || user?.name || null,
          relationship_type: formData.relationship_type || null,
        }
      };

      const newClient = await clientService.createClient(clientData);
      
      toast.success('Client created successfully!');
      onClientCreated(newClient);
      navigate('/');
    } catch (error) {
      toast.error('Failed to create client');
      console.error('Create client error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Client</h1>
        <p className="text-gray-600">Create a new person or company client profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Type Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setClientType('person')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                clientType === 'person'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 mr-2" />
                <span className="font-medium">Person</span>
              </div>
              <p className="text-sm text-gray-600">Individual client or contact</p>
            </button>
            
            <button
              type="button"
              onClick={() => setClientType('company')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                clientType === 'company'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <Building2 className="h-5 w-5 mr-2" />
                <span className="font-medium">Company</span>
              </div>
              <p className="text-sm text-gray-600">Business or organization</p>
            </button>
          </div>
        </div>

        {/* Client Existence */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Existence</h2>
          <div className="mt-6">
            {clientType === 'person' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by SSN
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by EIN
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {clientType === 'person' ? 'Personal Information' : 'Company Information'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clientType === 'person' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spouse Name
                  </label>
                  <input
                    type="text"
                    name="spouse_name"
                    value={formData.spouse_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filing Status *
                  </label>
                  <select
                    name="filing_status"
                    value={formData.filing_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    <option value="1040">1040</option>
                    <option value="1040NR">1040NR</option>
                    <option value="1040NR_5472">1040NR - 5472</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filing Details *
                  </label>
                  <select
                    name="filing_details"
                    value={formData.filing_details}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select details</option>
                    <option value="single">Single</option>
                    <option value="married_jointly">Married Filing Jointly</option>
                    <option value="married_separately">Married Filing Separately</option>
                    <option value="head_of_household">Head of Household</option>
                    <option value="surviving_spouse">Surviving Spouse</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DBA
                  </label>
                  <input
                    type="text"
                    name="dba"
                    value={formData.dba}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filing Status *
                  </label>
                  <select
                    name="filing_status"
                    value={formData.filing_status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select status</option>
                    <option value="1120">1120</option>
                    <option value="1120_5472">1120 - 5472</option>
                    <option value="5471">5471</option>
                    <option value="1120S">1120S</option>
                    <option value="1065">1065</option>
                    <option value="1065_8805/04">1065 - 8805/04</option>
                    <option value="990">990</option>
                    <option value="990_EZ">990 EZ</option>
                    <option value="1042S">1042S</option>
                    <option value="sch_c">Sch C</option>
                  </select>
                </div>
              </>
            )}
            
            {/* Common fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.secondary_email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Phone Numbers
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.additional_phones}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-6 gap-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {clientType === 'person' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SSN *
                    </label>
                    <input
                      type="text"
                      name="ssn"
                      value={formData.ssn}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spouse SSN
                    </label>
                    <input
                      type="text"
                      name="spouse_ssn"
                      value={formData.spouse_ssn}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="text"
                      name="date_birth"
                      value={formData.date_birth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sapouse Date of Birth
                    </label>
                    <input
                      type="text"
                      name="spouse_date_birth"
                      value={formData.spouse_date_birth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      EIN *
                    </label>
                    <input
                      type="text"
                      name="ein"
                      value={formData.ein}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incorporation Date
                    </label>
                    <input
                      type="text"
                      name="incorporation_date"
                      value={formData.incorporation_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incorporation State
                    </label>
                    <input
                      type="text"
                      name="incorporation_state"
                      value={formData.incorporation_state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </>
              )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Rep
              </label>
              <input
                type="text"
                name="sales_rep"
                value={formData.sales_rep}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Manager
              </label>
              <input
                type="text"
                name="client_manager"
                value={formData.client_manager}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Ownership Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ownership & Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Owner *
              </label>
              <input
                type="text"
                name="primary_owner"
                value={formData.primary_owner}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Manager
              </label>
              <input
                type="text"
                name="account_manager"
                value={formData.account_manager}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship Type
              </label>
              <select
                name="relationship_type"
                value={formData.relationship_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="prospect">Prospect</option>
                <option value="active">Active Client</option>
                <option value="dormant">Dormant</option>
                <option value="partner">Partner</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="spinner mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClient;