import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Row, Col, Typography } from 'antd';
import { TicketAperto } from '../types/models';
import { ForeignKeySelect } from './ForeignKeySelect';

const { TextArea } = Input;
const { Text } = Typography;

interface TicketFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<TicketAperto>;
  onSubmit: (values: Partial<TicketAperto>) => Promise<void>;
  onCancel: () => void;
}

const REQUIRED_LABEL = (label: string) => (
  <span style={{ fontWeight: 600 }}>
    {label} <span style={{ color: '#dc2626' }}>*</span>
  </span>
);

export const TicketFormModal: React.FC<TicketFormModalProps> = ({
  open,
  mode,
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [macroCausaId, setMacroCausaId] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialValues) {
        form.setFieldsValue({
          titolo: initialValues.titolo,
          descrizione: initialValues.descrizione,
          competenzaId: initialValues.competenzaId,
          macroCausaId: initialValues.macroCausaId,
          causaId: initialValues.causaId,
          stato: initialValues.stato,
          priorita: initialValues.priorita,
        });
        setMacroCausaId(initialValues.macroCausaId);
      } else {
        form.resetFields();
        form.setFieldsValue({ stato: 'Aperto', priorita: 'Media' });
        setMacroCausaId(undefined);
      }
    }
  }, [open, mode, initialValues, form]);

  const handleValuesChange = (changedValues: Record<string, unknown>) => {
    if ('macroCausaId' in changedValues) {
      const newMacroCausaId = changedValues.macroCausaId as number | undefined;
      setMacroCausaId(newMacroCausaId);
      form.setFieldValue('causaId', undefined);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error: any) {
      if (!error.errorFields) {
        // API error – parent already showed the message; keep modal open
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setMacroCausaId(undefined);
    onCancel();
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
          {mode === 'create' ? 'Nuovo Ticket' : 'Modifica Ticket'}
        </span>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={mode === 'create' ? 'Crea Ticket' : 'Salva Modifiche'}
      cancelText="Annulla"
      okButtonProps={{ loading: submitting }}
      width={720}
      styles={{ body: { paddingTop: 8 } }}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        requiredMark={false}
      >
        {/* Titolo */}
        <Form.Item
          label={REQUIRED_LABEL('Titolo')}
          name="titolo"
          rules={[{ required: true, message: 'Inserisci il titolo del ticket' }]}
        >
          <Input
            size="large"
            placeholder="Es. Problema di accesso al sistema CRM"
            showCount
            maxLength={200}
          />
        </Form.Item>

        {/* Descrizione */}
        <Form.Item
          label={REQUIRED_LABEL('Descrizione')}
          name="descrizione"
          rules={[{ required: true, message: 'Inserisci la descrizione del ticket' }]}
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              Fornisci tutte le informazioni necessarie per gestire il ticket
            </Text>
          }
        >
          <TextArea
            rows={3}
            placeholder="Descrivi il problema o la richiesta in dettaglio..."
          />
        </Form.Item>

        {/* Competenza + Priorità */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={REQUIRED_LABEL('Competenza')}
              name="competenzaId"
              rules={[{ required: true, message: 'Seleziona una competenza' }]}
            >
              <ForeignKeySelect
                type="competenza"
                placeholder="Seleziona la competenza"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={REQUIRED_LABEL('Priorità')}
              name="priorita"
              rules={[{ required: true, message: 'Seleziona una priorità' }]}
            >
              <Select size="large" placeholder="Seleziona la priorità">
                <Select.Option value="Bassa">🟢 Bassa</Select.Option>
                <Select.Option value="Media">🔵 Media</Select.Option>
                <Select.Option value="Alta">🟡 Alta</Select.Option>
                <Select.Option value="Critica">🔴 Critica</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Macro Causa + Causa */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={REQUIRED_LABEL('Macro Causa')}
              name="macroCausaId"
              rules={[{ required: true, message: 'Seleziona una macro causa' }]}
            >
              <ForeignKeySelect
                type="macrocausa"
                placeholder="Seleziona la macro causa"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={REQUIRED_LABEL('Causa')}
              name="causaId"
              rules={[{ required: true, message: 'Seleziona una causa' }]}
              extra={
                !macroCausaId ? (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ← Seleziona prima una macro causa
                  </Text>
                ) : null
              }
            >
              <ForeignKeySelect
                type="causa"
                macroCausaId={macroCausaId}
                disabled={!macroCausaId}
                placeholder={
                  macroCausaId ? 'Seleziona la causa' : 'Disponibile dopo macro causa'
                }
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Stato */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={REQUIRED_LABEL('Stato')}
              name="stato"
              rules={[{ required: true, message: 'Seleziona uno stato' }]}
            >
              <Select size="large" placeholder="Seleziona lo stato">
                <Select.Option value="Aperto">Aperto</Select.Option>
                <Select.Option value="In Lavorazione">In Lavorazione</Select.Option>
                <Select.Option value="Risolto">Risolto</Select.Option>
                <Select.Option value="Chiuso">Chiuso</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
