import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Input, Select, message } from 'antd';
import { PlusOutlined, MessageOutlined, MessageFilled } from '@ant-design/icons';
import { TicketAperto } from '../types/models';
import { ticketService } from '../services/ticketService';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { ActionsMenu } from './ActionsMenu';
import { TicketFormModal } from './TicketFormModal';
import { CommentModal } from './CommentModal';

export const TicketTable: React.FC = () => {
  const [tickets, setTickets] = useState<TicketAperto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statoFilter, setStatoFilter] = useState<string | undefined>(undefined);
  const [prioritaFilter, setPrioritaFilter] = useState<string | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketAperto | null>(null);
  const [commentModalTicket, setCommentModalTicket] = useState<TicketAperto | null>(null);

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

  const handleDelete = async (id: number) => {
    try {
      await ticketService.delete(id);
      message.success('Ticket eliminato con successo');
      loadTickets();
    } catch (error) {
      message.error("Errore nell'eliminazione del ticket");
    }
  };

  const handleCreate = async (values: Partial<TicketAperto>) => {
    try {
      await ticketService.create(values);
      message.success('Ticket creato con successo');
      setIsCreateModalOpen(false);
      loadTickets();
    } catch (error) {
      message.error('Errore nella creazione del ticket');
      console.error(error);
      throw error;
    }
  };

  const handleUpdate = async (values: Partial<TicketAperto>) => {
    if (!editingTicket?.id) return;
    try {
      await ticketService.update(editingTicket.id, { ...editingTicket, ...values });
      message.success('Ticket aggiornato con successo');
      setEditingTicket(null);
      loadTickets();
    } catch (error) {
      message.error("Errore nell'aggiornamento del ticket");
      console.error(error);
      throw error;
    }
  };

  // Client-side filtering applied on top of loaded data
  const filteredTickets = useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
    return tickets.filter((ticket) => {
      const matchesSearch =
        !searchText ||
        ticket.titolo.toLowerCase().includes(lowerSearch) ||
        (ticket.descrizione && ticket.descrizione.toLowerCase().includes(lowerSearch));
      const matchesStato = !statoFilter || ticket.stato === statoFilter;
      const matchesPriorita = !prioritaFilter || ticket.priorita === prioritaFilter;
      return matchesSearch && matchesStato && matchesPriorita;
    });
  }, [tickets, searchText, statoFilter, prioritaFilter]);

  const columns = [
    {
      title: 'Ticket',
      key: 'ticket',
      render: (_: unknown, record: TicketAperto) => (
        <div>
          <div
            style={{
              fontWeight: 600,
              color: '#111827',
              marginBottom: 2,
              lineHeight: '1.4',
            }}
          >
            {record.titolo}
          </div>
          {record.descrizione && (
            <div
              style={{
                color: '#6b7280',
                fontSize: 13,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 480,
              }}
              title={record.descrizione}
            >
              {record.descrizione}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Stato',
      dataIndex: 'stato',
      key: 'stato',
      width: 150,
      render: (stato: string) => <StatusBadge status={stato} />,
    },
    {
      title: 'Priorità',
      dataIndex: 'priorita',
      key: 'priorita',
      width: 120,
      render: (priorita: string) => <PriorityBadge priority={priorita} />,
    },
    {
      title: 'Data Apertura',
      dataIndex: 'dataApertura',
      key: 'dataApertura',
      width: 140,
      sorter: (a: TicketAperto, b: TicketAperto) =>
        (a.dataApertura ? new Date(a.dataApertura).getTime() : 0) -
        (b.dataApertura ? new Date(b.dataApertura).getTime() : 0),
      render: (date: Date) => (date ? new Date(date).toLocaleDateString('it-IT') : '—'),
    },
    {
      title: '',
      key: 'comment',
      width: 56,
      align: 'center' as const,
      render: (_: unknown, record: TicketAperto) => {
        // Verifica se il ticket ha commenti (record.commenti dal backend con Include)
        const hasComment = record.commenti && record.commenti.length > 0;
        return (
          <Button
            type="text"
            icon={
              hasComment ? (
                <MessageFilled style={{ fontSize: 18, color: '#1890ff' }} />
              ) : (
                <MessageOutlined style={{ fontSize: 18, color: '#d9d9d9' }} />
              )
            }
            onClick={() => setCommentModalTicket(record)}
            title={hasComment ? 'Visualizza commento' : 'Aggiungi commento'}
          />
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 56,
      fixed: 'right' as const,
      render: (_: unknown, record: TicketAperto) => (
        <ActionsMenu
          onEdit={() => setEditingTicket(record)}
          onDelete={() => { if (record.id !== undefined) handleDelete(record.id); }}
        />
      ),
    },
  ];

  return (
    <div className="ticket-table-container">
      {/* Toolbar */}
      <div className="ticket-toolbar">
        <Input.Search
          placeholder="Cerca per titolo o descrizione..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={setSearchText}
          style={{ flex: '1 1 280px', maxWidth: 420 }}
        />
        <Select
          placeholder="Stato"
          allowClear
          value={statoFilter}
          onChange={setStatoFilter}
          style={{ width: 160 }}
        >
          <Select.Option value="Aperto">Aperto</Select.Option>
          <Select.Option value="In Lavorazione">In Lavorazione</Select.Option>
          <Select.Option value="Risolto">Risolto</Select.Option>
          <Select.Option value="Chiuso">Chiuso</Select.Option>
        </Select>
        <Select
          placeholder="Priorità"
          allowClear
          value={prioritaFilter}
          onChange={setPrioritaFilter}
          style={{ width: 140 }}
        >
          <Select.Option value="Bassa">Bassa</Select.Option>
          <Select.Option value="Media">Media</Select.Option>
          <Select.Option value="Alta">Alta</Select.Option>
          <Select.Option value="Critica">Critica</Select.Option>
        </Select>
        <div style={{ marginLeft: 'auto' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Nuovo Ticket
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredTickets}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Totale ${total} ticket`,
          placement: ['bottomEnd'],
        }}
        rowClassName="ticket-row"
      />

      {/* Create modal */}
      <TicketFormModal
        open={isCreateModalOpen}
        mode="create"
        onSubmit={handleCreate}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      {/* Edit modal */}
      <TicketFormModal
        open={editingTicket !== null}
        mode="edit"
        initialValues={editingTicket ?? undefined}
        onSubmit={handleUpdate}
        onCancel={() => setEditingTicket(null)}
      />

      {/* Comment modal */}
      {commentModalTicket && (
        <CommentModal
          visible={commentModalTicket !== null}
          onClose={() => {
            setCommentModalTicket(null);
            loadTickets(); // Ricarica per aggiornare l'icona commenti
          }}
          ticketId={commentModalTicket.id!}
          codiceTicket={commentModalTicket.codiceTicket || `TICKET-${commentModalTicket.id}`}
        />
      )}
    </div>
  );
};
