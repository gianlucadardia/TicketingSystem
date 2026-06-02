import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import { apiClient } from '../services/api';

interface Props {
  value?: number;
  onChange?: (value: number | undefined) => void;
  type: 'competenza' | 'macrocausa' | 'causa';
  macroCausaId?: number; // Required for 'causa' type
  disabled?: boolean;
  placeholder?: string;
}

export const ForeignKeySelect: React.FC<Props> = ({
  value,
  onChange,
  type,
  macroCausaId,
  disabled,
  placeholder
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, [type, macroCausaId]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      switch (type) {
        case 'competenza':
          endpoint = '/competenze';
          break;
        case 'macrocausa':
          endpoint = '/macrocause';
          break;
        case 'causa':
          endpoint = macroCausaId 
            ? `/cause/bymacrocausa/${macroCausaId}`
            : '/cause';
          break;
      }
      
      const response = await apiClient.get(endpoint);
      setOptions(response.data);
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder || `Seleziona ${type}`}
      allowClear
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={options.map((opt) => ({
        value: opt.id,
        label: opt.nome
      }))}
      loading={loading}
      disabled={disabled || (type === 'causa' && !macroCausaId)}
      style={{ width: '100%', minWidth: 150 }}
    />
  );
};
