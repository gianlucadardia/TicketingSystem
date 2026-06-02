import React from 'react';
import { Dropdown, Button, Modal } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

interface ActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const ActionsMenu: React.FC<ActionsMenuProps> = ({ onEdit, onDelete }) => {
  const handleDeleteClick = () => {
    Modal.confirm({
      title: 'Elimina ticket',
      icon: <ExclamationCircleOutlined style={{ color: '#dc2626' }} />,
      content: "Sei sicuro di voler eliminare questo ticket? L'operazione non può essere annullata.",
      okText: 'Elimina',
      okButtonProps: { danger: true },
      cancelText: 'Annulla',
      onOk: onDelete,
    });
  };

  const items = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Modifica',
      onClick: onEdit,
    },
    { type: 'divider' as const },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Elimina',
      danger: true,
      onClick: handleDeleteClick,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <Button
        type="text"
        icon={<MoreOutlined style={{ fontSize: 18 }} />}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          borderRadius: 6,
          padding: 0,
        }}
        aria-label="Opzioni ticket"
      />
    </Dropdown>
  );
};
