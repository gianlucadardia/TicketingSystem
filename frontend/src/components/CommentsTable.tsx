import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Button, Modal, Form, App as AntdApp } from 'antd';
import { Commento } from '../types/models';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { commentService } from '../services/commentService';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

export const CommentsTable: React.FC = () => {
  const { message, modal } = AntdApp.useApp();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Commento[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editingComment, setEditingComment] = useState<Commento | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await commentService.getAll(searchText);
      setComments(data);
    } catch (error) {
      message.error('Errore nel caricamento dei commenti');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [message, searchText]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSearch = () => {
    loadComments();
  };

  const handleEdit = (comment: Commento) => {
    setEditingComment(comment);
    form.setFieldsValue({ testo: comment.testo });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingComment?.id) return;

    try {
      const values = await form.validateFields();
      await commentService.update({
        ...editingComment,
        testo: values.testo,
      });
      message.success('Commento aggiornato con successo');
      setIsModalOpen(false);
      setEditingComment(null);
      form.resetFields();
      loadComments();
    } catch (error) {
      message.error("Errore nell'aggiornamento del commento");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    modal.confirm({
      title: 'Conferma eliminazione',
      content: 'Sei sicuro di voler eliminare questo commento?',
      okText: 'Elimina',
      okType: 'danger',
      cancelText: 'Annulla',
      onOk: async () => {
        try {
          await commentService.delete(id);
          message.success('Commento eliminato con successo');
          loadComments();
        } catch (error) {
          message.error("Errore nell'eliminazione del commento");
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Codice Ticket',
      dataIndex: 'codiceTicket',
      key: 'codiceTicket',
      width: 150,
      render: (codiceTicket: string) => (
        <Button
          type="link"
          onClick={() => navigate(`/?codiceTicket=${encodeURIComponent(codiceTicket)}`)}
          style={{ fontWeight: 600, padding: 0 }}
        >
          {codiceTicket}
        </Button>
      ),
    },
    {
      title: 'Testo',
      dataIndex: 'testo',
      key: 'testo',
      ellipsis: true,
    },
    {
      title: 'Autore',
      dataIndex: 'autore',
      key: 'autore',
      width: 180,
    },
    {
      title: 'Data Creazione',
      dataIndex: 'creatoIl',
      key: 'creatoIl',
      width: 160,
      render: (date: Date) =>
        date ? new Date(date).toLocaleString('it-IT') : '—',
    },
    {
      title: 'Azioni',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: Commento) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (record.id) handleDelete(record.id);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <Input.Search
          placeholder="Cerca nei commenti (testo, codice ticket, autore)..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          style={{ flex: 1, maxWidth: 600 }}
          enterButton={<SearchOutlined />}
        />
      </div>

      <Table
        dataSource={comments}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Totale: ${total} commenti`,
        }}
      />

      <Modal
        title="Modifica Commento"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingComment(null);
          form.resetFields();
        }}
        okText="Salva"
        cancelText="Annulla"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Testo del commento"
            name="testo"
            rules={[{ required: true, message: 'Il commento è obbligatorio' }]}
          >
            <TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
