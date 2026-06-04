import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Input, Select, Segmented, message } from 'antd';
import { PlusOutlined, MessageOutlined, MessageFilled } from '@ant-design/icons';
import { TicketAperto } from '../types/models';
import { ticketService } from '../services/ticketService';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { ActionsMenu } from './ActionsMenu';
import { TicketFormModal } from './TicketFormModal';
import { CommentModal } from './CommentModal';
import { useSearchParams } from 'react-router-dom';

type FilterMode = 'withoutComments' | 'certified' | 'all';

export const TicketTable: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<TicketAperto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('withoutComments');
  const [searchText, setSearchText] = useState('');
  const [statoFilter, setStatoFilter] = useState<string | undefined>(undefined);
  const [prioritaFilter, setPrioritaFilter] = useState<string | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketAperto | null>(null);
  const [commentModalTicket, setCommentModalTicket] = useState<TicketAperto | null>(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const codiceTicketFilter = searchParams.get('codiceTicket') ?? '';

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (codiceTicketFilter) {
      // Deep-link by codice ticket must surface the ticket regardless of default mode.
      setFilterMode('all');
      setSearchText(codiceTicketFilter);
      setStatoFilter(undefined);
      setPrioritaFilter(undefined);
    }
  }, [codiceTicketFilter]);

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

  const countsByMode = useMemo(() => {
    const withoutComments = tickets.filter((ticket) => (ticket.commenti?.length ?? 0) === 0).length;
    const certified = tickets.filter((ticket) => (ticket.commenti?.length ?? 0) >= 1).length;

    return {
      withoutComments,
      certified,
      all: tickets.length,
    };
  }, [tickets]);

  // Client-side filtering applied on top of loaded data
  const filteredTickets = useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = tickets.filter((ticket) => {
      const commentCount = ticket.commenti?.length ?? 0;
      const matchesMode =
        filterMode === 'all' ||
        (filterMode === 'withoutComments' && commentCount === 0) ||
        (filterMode === 'certified' && commentCount >= 1);
      const matchesSearch =
        !searchText ||
        (ticket.codiceTicket && ticket.codiceTicket.toLowerCase().includes(lowerSearch)) ||
        ticket.titolo.toLowerCase().includes(lowerSearch) ||
        (ticket.descrizione && ticket.descrizione.toLowerCase().includes(lowerSearch));
      const matchesStato = !statoFilter || ticket.stato === statoFilter;
      const matchesPriorita = !prioritaFilter || ticket.priorita === prioritaFilter;
      return matchesMode && matchesSearch && matchesStato && matchesPriorita;
    });

    // Prioritize newest tickets first when working on non-certified items.
    if (filterMode === 'withoutComments') {
      return [...filtered].sort(
        (a, b) => (b.dataApertura ? new Date(b.dataApertura).getTime() : 0) -
          (a.dataApertura ? new Date(a.dataApertura).getTime() : 0)
      );
    }

    return filtered;
  }, [tickets, filterMode, searchText, statoFilter, prioritaFilter]);

  const renderExpandedDetails = (record: TicketAperto) => (
    <div style={{ padding: '8px 4px 4px 4px', display: 'grid', gap: 10 }}>
      <div>
        <strong>Descrizione:</strong>{' '}
        {record.descrizione && record.descrizione.trim() ? record.descrizione : '—'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(160px, 1fr))', gap: 12 }}>
        <div>
          <strong>Competenza:</strong> {record.competenza?.nome ?? '—'}
        </div>
        <div>
          <strong>Macro Causa:</strong> {record.macroCausa?.nome ?? '—'}
        </div>
        <div>
          <strong>Causa:</strong> {record.causa?.nome ?? '—'}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(160px, 1fr))', gap: 12 }}>
        <div>
          <strong>Apertura:</strong>{' '}
          {record.dataApertura ? new Date(record.dataApertura).toLocaleString('it-IT') : '—'}
        </div>
        <div>
          <strong>Chiusura:</strong>{' '}
          {record.dataChiusura ? new Date(record.dataChiusura).toLocaleString('it-IT') : '—'}
        </div>
        <div>
          <strong>Modifica:</strong>{' '}
          {record.modificatoIl ? new Date(record.modificatoIl).toLocaleString('it-IT') : '—'}
        </div>
      </div>
    </div>
  );

  const columns = [
    {
      title: 'Codice',
      dataIndex: 'codiceTicket',
      key: 'codiceTicket',
      width: 120,
      render: (codiceTicket: string | undefined) => (
        <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
          {codiceTicket ?? '—'}
        </span>
      ),
    },
    {
      title: 'Titolo',
      key: 'titolo',
      render: (_: unknown, record: TicketAperto) => (
        <div>
          <div
            style={{
              fontWeight: 600,
              color: '#111827',
              lineHeight: '1.4',
            }}
          >
            {record.titolo}
          </div>
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
            title={hasComment ? 'Ticket certificato: visualizza commento' : 'Aggiungi commento (certifica)'}
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
          placeholder="Cerca per codice ticket, titolo o descrizione..."
          allowClear
          value={searchText}
          onChange={(e) => {
            const value = e.target.value;
            setSearchText(value);
            if (!value && codiceTicketFilter) {
              setSearchParams({});
              setFilterMode('withoutComments');
            }
          }}
          onSearch={(value) => {
            setSearchText(value);
            if (!value && codiceTicketFilter) {
              setSearchParams({});
              setFilterMode('withoutComments');
            }
          }}
          style={{ flex: '1 1 280px', maxWidth: 420 }}
        />
        <Segmented
          options={[
            { label: `Senza commenti (${countsByMode.withoutComments})`, value: 'withoutComments' },
            { label: `Certificati (${countsByMode.certified})`, value: 'certified' },
            { label: `Tutti (${countsByMode.all})`, value: 'all' },
          ]}
          value={filterMode}
          onChange={(value) => setFilterMode(value as FilterMode)}
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
        expandable={{
          expandedRowRender: renderExpandedDetails,
          expandRowByClick: true,
          expandedRowKeys,
          onExpandedRowsChange: (keys) => {
            const latestKey = keys.length > 0 ? keys[keys.length - 1] : undefined;
            setExpandedRowKeys(latestKey !== undefined ? [latestKey] : []);
          },
        }}
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
