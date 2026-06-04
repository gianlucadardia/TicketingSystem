import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Button, Typography, App as AntdApp } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { Commento } from '../types/models';
import { commentService } from '../services/commentService';

const { TextArea } = Input;
const { Text } = Typography;

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  ticketId: number;
  codiceTicket: string;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  ticketId,
  codiceTicket,
}) => {
  const { message, modal } = AntdApp.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [existingComment, setExistingComment] = useState<Commento | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadComment = useCallback(async () => {
    try {
      const comments = await commentService.getByTicketId(ticketId);
      if (comments.length > 0) {
        const comment = comments[0];
        setExistingComment(comment);
        form.setFieldsValue({ testo: comment.testo });
        setIsEditing(false);
      } else {
        setExistingComment(null);
        form.resetFields();
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Errore nel caricamento del commento:', error);
    }
  }, [ticketId, form]);

  useEffect(() => {
    if (visible) {
      loadComment();
    }
  }, [visible, loadComment]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (existingComment) {
        await commentService.update({
          ...existingComment,
          testo: values.testo,
        });
        message.success('Commento aggiornato con successo');
      } else {
        await commentService.create({
          ticketId,
          testo: values.testo,
        });
        message.success('Commento creato con successo');
      }

      await loadComment();
      setIsEditing(false);
    } catch (error) {
      message.error('Errore nel salvataggio del commento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingComment?.id) return;

    modal.confirm({
      title: 'Conferma eliminazione',
      content: 'Sei sicuro di voler eliminare questo commento?',
      okText: 'Elimina',
      okType: 'danger',
      cancelText: 'Annulla',
      onOk: async () => {
        try {
          await commentService.delete(existingComment.id!);
          message.success('Commento eliminato con successo');
          setExistingComment(null);
          form.resetFields();
          setIsEditing(true);
        } catch (error) {
          message.error("Errore nell'eliminazione del commento");
          console.error(error);
        }
      },
    });
  };

  const handleCancel = () => {
    if (existingComment) {
      form.setFieldsValue({ testo: existingComment.testo });
      setIsEditing(false);
    } else {
      form.resetFields();
    }
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageOutlined />
          <span>Commento - {codiceTicket}</span>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Testo del commento"
          name="testo"
          rules={[{ required: true, message: 'Il commento è obbligatorio' }]}
        >
          <TextArea
            rows={6}
            placeholder="Inserisci il tuo commento..."
            disabled={!isEditing}
          />
        </Form.Item>

        {existingComment && !isEditing && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Creato da: {existingComment.autore} il{' '}
              {existingComment.creatoIl
                ? new Date(existingComment.creatoIl).toLocaleString('it-IT')
                : '—'}
            </Text>
            {existingComment.modificatoIl && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Ultima modifica:{' '}
                  {new Date(existingComment.modificatoIl).toLocaleString('it-IT')}
                </Text>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {!isEditing && (
            <>
              <Button onClick={() => setIsEditing(true)}>Modifica</Button>
              <Button danger onClick={handleDelete}>
                Elimina
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button onClick={handleCancel}>Annulla</Button>
              <Button type="primary" loading={loading} onClick={handleSave}>
                Salva
              </Button>
            </>
          )}
        </div>
      </Form>
    </Modal>
  );
};
