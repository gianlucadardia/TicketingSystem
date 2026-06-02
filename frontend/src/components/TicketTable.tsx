import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Input, Select, message, Tag, Modal, Form } from 'antd';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { TicketAperto } from '../types/models';
import { ticketService } from '../services/ticketService';
import { ForeignKeySelect } from './ForeignKeySelect';

const { Search } = Input;
const { TextArea } = Input;

export const TicketTable: React.FC = () => {
  const [tickets, setTickets] = useState<TicketAperto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [newTicket, setNewTicket] = useState<Partial<TicketAperto>>({
    stato: 'Aperto',
    priorita: 'Media'
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getAll();
      setTickets(data);
    } catch (error) {
      message.error('Errore nel caricamento dei ticket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    setLoading(true);
    try {
      const data = await ticketService.search(value);
      setTickets(data);
    } catch (error) {
      message.error('Errore nella ricerca');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: TicketAperto) => {
    setEditingKey(record.id!);
  };

  const handleSave = async (record: TicketAperto) => {
    try {
      await ticketService.update(record.id!, record);
      message.success('Ticket aggiornato con successo');
      setEditingKey(null);
      loadTickets();
    } catch (error) {
      message.error('Errore nell\'aggiornamento del ticket');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ticketService.delete(id);
      message.success('Ticket eliminato con successo');
      loadTickets();
    } catch (error) {
      message.error('Errore nell\'eliminazione del ticket');
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setNewTicket({
      stato: 'Aperto',
      priorita: 'Media'
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setNewTicket({
      stato: 'Aperto',
      priorita: 'Media'
    });
  };

  const handleCreateTicket = async () => {
    try {
      const values = await form.validateFields();
      const ticketData: Partial<TicketAperto> = {
        ...newTicket,
        titolo: values.titolo,
        descrizione: values.descrizione,
        competenzaId: values.competenzaId,
        macroCausaId: values.macroCausaId,
        causaId: values.causaId,
        stato: values.stato,
        priorita: values.priorita
        // dataApertura e creatoDa vengono settati dal backend
      };
      
      await ticketService.create(ticketData);
      message.success('Ticket creato con successo');
      setIsModalVisible(false);
      form.resetFields();
      setNewTicket({
        stato: 'Aperto',
        priorita: 'Media'
      });
      loadTickets();
    } catch (error: any) {
      if (error.errorFields) {
        message.error('Compila tutti i campi obbligatori');
      } else {
        message.error('Errore nella creazione del ticket');
        console.error(error);
      }
    }
  };

  const getStatoColor = (stato: string) => {
    const colors: Record<string, string> = {
      'Aperto': 'blue',
      'In Lavorazione': 'orange',
      'Risolto': 'green',
      'Chiuso': 'default'
    };
    return colors[stato] || 'default';
  };

  const getPrioritaColor = (priorita: string) => {
    const colors: Record<string, string> = {
      'Bassa': 'green',
      'Media': 'blue',
      'Alta': 'orange',
      'Critica': 'red'
    };
    return colors[priorita] || 'default';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a: TicketAperto, b: TicketAperto) => (a.id || 0) - (b.id || 0),
    },
    {
      title: 'Titolo',
      dataIndex: 'titolo',
      key: 'titolo',
      editable: true,
      sorter: (a: TicketAperto, b: TicketAperto) => a.titolo.localeCompare(b.titolo),
    },
    {
      title: 'Descrizione',
      dataIndex: 'descrizione',
      key: 'descrizione',
      editable: true,
      ellipsis: true,
    },
    {
      title: 'Competenza',
      dataIndex: 'competenzaId',
      key: 'competenzaId',
      width: 180,
      render: (value: number, record: TicketAperto) => (
        <ForeignKeySelect
          value={value}
          onChange={(val) => {
            const updatedTickets = tickets.map(t => 
              t.id === record.id ? { ...t, competenzaId: val } : t
            );
            setTickets(updatedTickets);
          }}
          type="competenza"
          disabled={editingKey !== record.id}
        />
      ),
    },
    {
      title: 'Macro Causa',
      dataIndex: 'macroCausaId',
      key: 'macroCausaId',
      width: 180,
      render: (value: number, record: TicketAperto) => (
        <ForeignKeySelect
          value={value}
          onChange={(val) => {
            const updatedTickets = tickets.map(t => 
              t.id === record.id ? { ...t, macroCausaId: val, causaId: undefined } : t
            );
            setTickets(updatedTickets);
          }}
          type="macrocausa"
          disabled={editingKey !== record.id}
        />
      ),
    },
    {
      title: 'Causa',
      dataIndex: 'causaId',
      key: 'causaId',
      width: 180,
      render: (value: number, record: TicketAperto) => (
        <ForeignKeySelect
          value={value}
          onChange={(val) => {
            const updatedTickets = tickets.map(t => 
              t.id === record.id ? { ...t, causaId: val } : t
            );
            setTickets(updatedTickets);
          }}
          type="causa"
          macroCausaId={record.macroCausaId}
          disabled={editingKey !== record.id || !record.macroCausaId}
        />
      ),
    },
    {
      title: 'Stato',
      dataIndex: 'stato',
      key: 'stato',
      width: 150,
      render: (value: string, record: TicketAperto) => (
        editingKey === record.id ? (
          <Select
            value={value}
            onChange={(val) => {
              const updatedTickets = tickets.map(t => 
                t.id === record.id ? { ...t, stato: val } : t
              );
              setTickets(updatedTickets);
            }}
            style={{ width: '100%' }}
          >
            <Select.Option value="Aperto">Aperto</Select.Option>
            <Select.Option value="In Lavorazione">In Lavorazione</Select.Option>
            <Select.Option value="Risolto">Risolto</Select.Option>
            <Select.Option value="Chiuso">Chiuso</Select.Option>
          </Select>
        ) : (
          <Tag color={getStatoColor(value)}>{value}</Tag>
        )
      ),
    },
    {
      title: 'Priorità',
      dataIndex: 'priorita',
      key: 'priorita',
      width: 120,
      render: (value: string, record: TicketAperto) => (
        editingKey === record.id ? (
          <Select
            value={value}
            onChange={(val) => {
              const updatedTickets = tickets.map(t => 
                t.id === record.id ? { ...t, priorita: val } : t
              );
              setTickets(updatedTickets);
            }}
            style={{ width: '100%' }}
          >
            <Select.Option value="Bassa">Bassa</Select.Option>
            <Select.Option value="Media">Media</Select.Option>
            <Select.Option value="Alta">Alta</Select.Option>
            <Select.Option value="Critica">Critica</Select.Option>
          </Select>
        ) : (
          <Tag color={getPrioritaColor(value)}>{value}</Tag>
        )
      ),
    },
    {
      title: 'Data Apertura',
      dataIndex: 'dataApertura',
      key: 'dataApertura',
      width: 150,
      render: (date: Date) => date ? new Date(date).toLocaleDateString('it-IT') : '-',
      sorter: (a: TicketAperto, b: TicketAperto) => 
        (a.dataApertura ? new Date(a.dataApertura).getTime() : 0) - 
        (b.dataApertura ? new Date(b.dataApertura).getTime() : 0),
    },
    {
      title: 'Azioni',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (text: any, record: TicketAperto) => (
        <Space>
          {editingKey === record.id ? (
            <>
              <Button type="primary" size="small" onClick={() => handleSave(record)}>
                Salva
              </Button>
              <Button size="small" onClick={() => {
                setEditingKey(null);
                loadTickets(); // Reload to reset changes
              }}>
                Annulla
              </Button>
            </>
          ) : (
            <>
              <Button 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => handleEdit(record)}
              >
                Modifica
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
                onClick={() => {
                  if (window.confirm('Sei sicuro di voler eliminare questo ticket?')) {
                    handleDelete(record.id!);
                  }
                }}
              >
                Elimina
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Search
          placeholder="Cerca ticket per titolo o descrizione..."
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ width: 400 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Nuovo Ticket
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={tickets}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Totale ${total} ticket`,
        }}
        scroll={{ x: 1500 }}
      />

      <Modal
        title="Crea Nuovo Ticket"
        open={isModalVisible}
        onOk={handleCreateTicket}
        onCancel={handleCancel}
        okText="Crea"
        cancelText="Annulla"
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            stato: 'Aperto',
            priorita: 'Media'
          }}
        >
          <Form.Item
            label="Titolo"
            name="titolo"
            rules={[{ required: true, message: 'Inserisci il titolo del ticket' }]}
          >
            <Input placeholder="Inserisci il titolo del ticket" />
          </Form.Item>

          <Form.Item
            label="Descrizione"
            name="descrizione"
            rules={[{ required: true, message: 'Inserisci la descrizione del ticket' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Descrivi il problema o la richiesta in dettaglio"
            />
          </Form.Item>

          <Form.Item
            label="Competenza"
            name="competenzaId"
            rules={[{ required: true, message: 'Seleziona una competenza' }]}
          >
            <ForeignKeySelect
              type="competenza"
              value={newTicket.competenzaId}
              onChange={(value) => {
                setNewTicket({ ...newTicket, competenzaId: value });
                form.setFieldValue('competenzaId', value);
              }}
              placeholder="Seleziona la competenza"
            />
          </Form.Item>

          <Form.Item
            label="Macro Causa"
            name="macroCausaId"
            rules={[{ required: true, message: 'Seleziona una macro causa' }]}
          >
            <ForeignKeySelect
              type="macrocausa"
              value={newTicket.macroCausaId}
              onChange={(value) => {
                setNewTicket({ ...newTicket, macroCausaId: value, causaId: undefined });
                form.setFieldValue('macroCausaId', value);
                form.setFieldValue('causaId', undefined);
              }}
              placeholder="Seleziona la macro causa"
            />
          </Form.Item>

          <Form.Item
            label="Causa"
            name="causaId"
            rules={[{ required: true, message: 'Seleziona una causa' }]}
          >
            <ForeignKeySelect
              type="causa"
              value={newTicket.causaId}
              onChange={(value) => {
                setNewTicket({ ...newTicket, causaId: value });
                form.setFieldValue('causaId', value);
              }}
              macroCausaId={newTicket.macroCausaId}
              disabled={!newTicket.macroCausaId}
              placeholder={
                newTicket.macroCausaId 
                  ? "Seleziona la causa" 
                  : "Seleziona prima una macro causa"
              }
            />
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              label="Stato"
              name="stato"
              rules={[{ required: true, message: 'Seleziona uno stato' }]}
              style={{ width: 200 }}
            >
              <Select
                value={newTicket.stato}
                onChange={(value) => {
                  setNewTicket({ ...newTicket, stato: value });
                  form.setFieldValue('stato', value);
                }}
              >
                <Select.Option value="Aperto">Aperto</Select.Option>
                <Select.Option value="In Lavorazione">In Lavorazione</Select.Option>
                <Select.Option value="Risolto">Risolto</Select.Option>
                <Select.Option value="Chiuso">Chiuso</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Priorità"
              name="priorita"
              rules={[{ required: true, message: 'Seleziona una priorità' }]}
              style={{ width: 200 }}
            >
              <Select
                value={newTicket.priorita}
                onChange={(value) => {
                  setNewTicket({ ...newTicket, priorita: value });
                  form.setFieldValue('priorita', value);
                }}
              >
                <Select.Option value="Bassa">Bassa</Select.Option>
                <Select.Option value="Media">Media</Select.Option>
                <Select.Option value="Alta">Alta</Select.Option>
                <Select.Option value="Critica">Critica</Select.Option>
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};
