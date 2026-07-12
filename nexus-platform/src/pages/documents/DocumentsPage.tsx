import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Download, Trash2, Share2, PenLine, UploadCloud } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SignaturePad } from '../../components/documents/SignaturePad';
import { Document, DocStatus } from '../../types';
import toast from 'react-hot-toast';

const STORE_KEY = 'nexus_documents';

const seedDocs: Document[] = [
  { id: '1', name: 'Pitch Deck 2024.pdf', type: 'PDF', size: '2.4 MB', lastModified: '2024-02-15', shared: true, url: '', ownerId: 'me', status: 'In Review' },
  { id: '2', name: 'Financial Projections.xlsx', type: 'Spreadsheet', size: '1.8 MB', lastModified: '2024-02-10', shared: false, url: '', ownerId: 'me', status: 'Draft' },
  { id: '3', name: 'Term Sheet.docx', type: 'Document', size: '3.2 MB', lastModified: '2024-02-05', shared: true, url: '', ownerId: 'me', status: 'Signed' },
];

const STATUS_VARIANT: Record<DocStatus, 'gray' | 'warning' | 'success'> = {
  'Draft': 'gray',
  'In Review': 'warning',
  'Signed': 'success',
};

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [signingDoc, setSigningDoc] = useState<Document | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORE_KEY);
    setDocuments(raw ? JSON.parse(raw) : seedDocs);
  }, []);

  const persist = (docs: Document[]) => {
    setDocuments(docs);
    localStorage.setItem(STORE_KEY, JSON.stringify(docs));
  };

  const onDrop = useCallback((accepted: File[]) => {
    const newDocs: Document[] = accepted.map(f => ({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      type: f.type.includes('pdf') ? 'PDF' : 'Document',
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      lastModified: new Date().toISOString().slice(0, 10),
      shared: false,
      url: '',
      ownerId: 'me',
      status: 'Draft',
    }));
    persist([...newDocs, ...documents]);
    toast.success(`${accepted.length} file(s) uploaded`);
  }, [documents]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/*': [] } });

  const setStatus = (id: string, status: DocStatus) =>
    persist(documents.map(d => (d.id === id ? { ...d, status } : d)));

  const removeDoc = (id: string) => persist(documents.filter(d => d.id !== id));

  const saveSignature = (dataUrl: string) => {
    if (!signingDoc) return;
    persist(documents.map(d => (d.id === signingDoc.id ? { ...d, status: 'Signed', signatureDataUrl: dataUrl } : d)));
    setSigningDoc(null);
    toast.success('Document signed');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Upload, review, and e-sign deal documents</p>
        </div>
      </div>

      {/* Upload dropzone */}
      <Card>
        <CardBody>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Drag & drop files here, or click to browse</p>
            <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel supported</p>
          </div>
        </CardBody>
      </Card>

      {/* Document list */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className="p-2 bg-primary-50 rounded-lg mr-4">
                  <FileText size={24} className="text-primary-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
                    {doc.shared && <Badge variant="secondary" size="sm">Shared</Badge>}
                    <Badge variant={STATUS_VARIANT[doc.status || 'Draft']} size="sm">{doc.status || 'Draft'}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>{doc.type}</span>
                    <span>{doc.size}</span>
                    <span>Modified {doc.lastModified}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {doc.status !== 'Signed' && (
                    <Button variant="outline" size="sm" leftIcon={<PenLine size={14} />} onClick={() => setSigningDoc(doc)}>
                      Sign
                    </Button>
                  )}
                  {doc.status === 'Draft' && (
                    <Button variant="ghost" size="sm" onClick={() => setStatus(doc.id, 'In Review')}>Send for Review</Button>
                  )}
                  <Button variant="ghost" size="sm" className="p-2" aria-label="Download"><Download size={18} /></Button>
                  <Button variant="ghost" size="sm" className="p-2" aria-label="Share"><Share2 size={18} /></Button>
                  <Button variant="ghost" size="sm" className="p-2 text-error-600 hover:text-error-700" aria-label="Delete" onClick={() => removeDoc(doc.id)}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Modal open={!!signingDoc} onClose={() => setSigningDoc(null)} title={`Sign: ${signingDoc?.name ?? ''}`} size="lg">
        {signingDoc && <SignaturePad onSave={saveSignature} onCancel={() => setSigningDoc(null)} />}
      </Modal>
    </div>
  );
};
