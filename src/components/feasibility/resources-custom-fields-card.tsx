'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import { useProject, useUpdateProject } from '@/hooks/use-projects';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, CURRENCIES, type CurrencyCode } from '@/lib/currencies';
import { Plus, Trash2, Package, Truck, ShoppingCart, Settings2, Type, Hash, Calendar } from 'lucide-react';

// أنواع البيانات
interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  items: string;
  rating: number; // 1-5
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number; // YER
  reorderLevel: number;
}

interface PurchaseOrder {
  id: string;
  supplierName: string;
  item: string;
  quantity: number;
  totalCost: number; // YER
  date: string;
  status: 'pending' | 'received' | 'cancelled';
}

interface CustomField {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea';
  value: any;
  section: string;
}

export function ResourcesCustomFieldsCard() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const displayCurrency = useAppStore((s) => s.displayCurrency);
  const { data: project } = useProject(currentProjectId);
  const updateProject = useUpdateProject();

  const cur = CURRENCIES[displayCurrency as CurrencyCode];

  const resources = (project?.resources as any) ?? { suppliers: [], inventory: [], purchaseOrders: [] };
  const customFields: CustomField[] = (project?.customFields as CustomField[]) ?? [];

  const [activeTab, setActiveTab] = useState<'suppliers' | 'inventory' | 'orders' | 'custom'>('suppliers');

  // Suppliers
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id'>>({ name: '', contact: '', phone: '', items: '', rating: 3 });
  const [showSupplierForm, setShowSupplierForm] = useState(false);

  const addSupplier = () => {
    if (!newSupplier.name || !currentProjectId) return;
    const updated = {
      ...resources,
      suppliers: [...(resources.suppliers ?? []), { ...newSupplier, id: Date.now().toString() }],
    };
    updateProject.mutate({ id: currentProjectId, data: { resources: updated } });
    setNewSupplier({ name: '', contact: '', phone: '', items: '', rating: 3 });
    setShowSupplierForm(false);
  };

  const deleteSupplier = (id: string) => {
    if (!currentProjectId) return;
    const updated = { ...resources, suppliers: resources.suppliers.filter((s: Supplier) => s.id !== id) };
    updateProject.mutate({ id: currentProjectId, data: { resources: updated } });
  };

  // Inventory
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({ name: '', quantity: 0, unit: 'قطعة', unitCost: 0, reorderLevel: 10 });
  const [showItemForm, setShowItemForm] = useState(false);

  const addItem = () => {
    if (!newItem.name || !currentProjectId) return;
    const updated = {
      ...resources,
      inventory: [...(resources.inventory ?? []), { ...newItem, id: Date.now().toString() }],
    };
    updateProject.mutate({ id: currentProjectId, data: { resources: updated } });
    setNewItem({ name: '', quantity: 0, unit: 'قطعة', unitCost: 0, reorderLevel: 10 });
    setShowItemForm(false);
  };

  const deleteItem = (id: string) => {
    if (!currentProjectId) return;
    const updated = { ...resources, inventory: resources.inventory.filter((i: InventoryItem) => i.id !== id) };
    updateProject.mutate({ id: currentProjectId, data: { resources: updated } });
  };

  // Purchase Orders
  const [newOrder, setNewOrder] = useState<Omit<PurchaseOrder, 'id'>>({ supplierName: '', item: '', quantity: 0, totalCost: 0, date: new Date().toISOString().slice(0, 10), status: 'pending' });
  const [showOrderForm, setShowOrderForm] = useState(false);

  const addOrder = () => {
    if (!newOrder.supplierName || !currentProjectId) return;
    const updated = {
      ...resources,
      purchaseOrders: [...(resources.purchaseOrders ?? []), { ...newOrder, id: Date.now().toString() }],
    };
    updateProject.mutate({ id: currentProjectId, data: { resources: updated } });
    setNewOrder({ supplierName: '', item: '', quantity: 0, totalCost: 0, date: new Date().toISOString().slice(0, 10), status: 'pending' });
    setShowOrderForm(false);
  };

  const updateOrderStatus = (id: string, status: PurchaseOrder['status']) => {
    if (!currentProjectId) return;
    const updated = {
      ...resources,
      purchaseOrders: resources.purchaseOrders.map((o: PurchaseOrder) => o.id === id ? { ...o, status } : o),
    };
    updateProject.mutate({ id: currentProjectId, data: { resources: updated } });
  };

  const deleteOrder = (id: string) => {
    if (!currentProjectId) return;
    const updated = { ...resources, purchaseOrders: resources.purchaseOrders.filter((o: PurchaseOrder) => o.id !== id) };
    updateProject.mutate({ id: currentProjectId, data: { resources: updated } });
  };

  // Custom Fields
  const [newField, setNewField] = useState<Omit<CustomField, 'id' | 'value'>>({ key: '', label: '', type: 'text', section: 'establishment' });
  const [showFieldForm, setShowFieldForm] = useState(false);

  const addField = () => {
    if (!newField.label || !currentProjectId) return;
    const key = newField.key || newField.label.replace(/\s+/g, '_').toLowerCase();
    const field: CustomField = {
      ...newField,
      key,
      id: Date.now().toString(),
      value: newField.type === 'number' ? 0 : '',
    };
    updateProject.mutate({ id: currentProjectId, data: { customFields: [...customFields, field] } });
    setNewField({ key: '', label: '', type: 'text', section: 'establishment' });
    setShowFieldForm(false);
  };

  const updateFieldValue = (id: string, value: any) => {
    if (!currentProjectId) return;
    const updated = customFields.map((f) => f.id === id ? { ...f, value } : f);
    updateProject.mutate({ id: currentProjectId, data: { customFields: updated } });
  };

  const deleteField = (id: string) => {
    if (!currentProjectId) return;
    updateProject.mutate({ id: currentProjectId, data: { customFields: customFields.filter((f) => f.id !== id) } });
  };

  if (!currentProjectId) return null;

  const inventoryValue = (resources.inventory ?? []).reduce((s: number, i: InventoryItem) => s + (i.quantity * i.unitCost), 0);
  const pendingOrdersValue = (resources.purchaseOrders ?? []).filter((o: PurchaseOrder) => o.status === 'pending').reduce((s: number, o: PurchaseOrder) => s + o.totalCost, 0);

  return (
    <Card className="p-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suppliers"><Truck className="size-4 me-1.5" />{locale === 'ar' ? 'موردين' : 'Suppliers'}</TabsTrigger>
          <TabsTrigger value="inventory"><Package className="size-4 me-1.5" />{locale === 'ar' ? 'مخزون' : 'Inventory'}</TabsTrigger>
          <TabsTrigger value="orders"><ShoppingCart className="size-4 me-1.5" />{locale === 'ar' ? 'طلبات' : 'Orders'}</TabsTrigger>
          <TabsTrigger value="custom"><Settings2 className="size-4 me-1.5" />{locale === 'ar' ? 'حقول' : 'Custom'}</TabsTrigger>
        </TabsList>

        {/* الموردون */}
        <TabsContent value="suppliers" className="space-y-3 mt-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <Truck className="size-4 text-blue-600" />
              {locale === 'ar' ? 'إدارة الموردين' : 'Suppliers Management'}
            </h3>
            <Button size="sm" variant="outline" onClick={() => setShowSupplierForm(!showSupplierForm)}>
              <Plus className="size-4" />
            </Button>
          </div>

          {showSupplierForm && (
            <div className="p-3 rounded-md border bg-secondary/30 grid grid-cols-2 gap-2">
              <Input placeholder={locale === 'ar' ? 'اسم المورد' : 'Supplier name'} value={newSupplier.name} onChange={(e) => setNewSupplier((p) => ({ ...p, name: e.target.value }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'مسؤول التواصل' : 'Contact'} value={newSupplier.contact} onChange={(e) => setNewSupplier((p) => ({ ...p, contact: e.target.value }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'هاتف' : 'Phone'} value={newSupplier.phone} onChange={(e) => setNewSupplier((p) => ({ ...p, phone: e.target.value }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'بنود التوريد' : 'Items'} value={newSupplier.items} onChange={(e) => setNewSupplier((p) => ({ ...p, items: e.target.value }))} className="text-sm" />
              <div className="col-span-2 flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowSupplierForm(false)}>{t('cancel')}</Button>
                <Button size="sm" onClick={addSupplier}>{t('save')}</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(resources.suppliers ?? []).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">{locale === 'ar' ? 'لا يوجد موردون' : 'No suppliers'}</div>
            ) : (
              (resources.suppliers ?? []).map((s: Supplier) => (
                <div key={s.id} className="p-3 rounded-md border bg-background/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {s.contact && <span className="me-2">👤 {s.contact}</span>}
                        {s.phone && <span className="me-2">📞 {s.phone}</span>}
                      </div>
                      {s.items && <div className="text-xs mt-1">{s.items}</div>}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1,2,3,4,5].map((star) => (
                          <span key={star} className={star <= s.rating ? 'text-amber-400' : 'text-muted'}>★</span>
                        ))}
                      </div>
                      <Button size="sm" variant="ghost" className="size-6 p-0 text-destructive" onClick={() => deleteSupplier(s.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* المخزون */}
        <TabsContent value="inventory" className="space-y-3 mt-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <Package className="size-4 text-amber-600" />
                {locale === 'ar' ? 'إدارة المخزون' : 'Inventory Management'}
              </h3>
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'القيمة الإجمالية' : 'Total value'}: {formatCurrency(inventoryValue, displayCurrency, locale)}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowItemForm(!showItemForm)}>
              <Plus className="size-4" />
            </Button>
          </div>

          {showItemForm && (
            <div className="p-3 rounded-md border bg-secondary/30 grid grid-cols-2 gap-2">
              <Input placeholder={locale === 'ar' ? 'اسم الصنف' : 'Item name'} value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'الكمية' : 'Quantity'} type="number" value={newItem.quantity} onChange={(e) => setNewItem((p) => ({ ...p, quantity: Number(e.target.value) || 0 }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'الوحدة' : 'Unit'} value={newItem.unit} onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'تكلفة الوحدة' : 'Unit cost'} type="number" value={newItem.unitCost ? (newItem.unitCost / cur.rateToYER).toFixed(2) : ''} onChange={(e) => setNewItem((p) => ({ ...p, unitCost: Number(e.target.value) * cur.rateToYER }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'حد إعادة الطلب' : 'Reorder level'} type="number" value={newItem.reorderLevel} onChange={(e) => setNewItem((p) => ({ ...p, reorderLevel: Number(e.target.value) || 0 }))} className="text-sm" />
              <div className="col-span-2 flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowItemForm(false)}>{t('cancel')}</Button>
                <Button size="sm" onClick={addItem}>{t('save')}</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(resources.inventory ?? []).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">{locale === 'ar' ? 'لا يوجد مخزون' : 'No inventory'}</div>
            ) : (
              (resources.inventory ?? []).map((item: InventoryItem) => {
                const lowStock = item.quantity <= item.reorderLevel;
                return (
                  <div key={item.id} className="p-2 rounded-md border bg-background/50 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-1">
                        {item.name}
                        {lowStock && <Badge variant="destructive" className="text-[9px] h-4">{locale === 'ar' ? 'منخفض' : 'Low'}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit} × {formatCurrency(item.unitCost, displayCurrency, locale)} = <b>{formatCurrency(item.quantity * item.unitCost, displayCurrency, locale)}</b>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="size-6 p-0 text-destructive" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* الطلبات */}
        <TabsContent value="orders" className="space-y-3 mt-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-1.5">
                <ShoppingCart className="size-4 text-emerald-600" />
                {locale === 'ar' ? 'طلبات الشراء' : 'Purchase Orders'}
              </h3>
              <p className="text-xs text-muted-foreground">{locale === 'ar' ? 'قيمة الطلبات المعلقة' : 'Pending value'}: {formatCurrency(pendingOrdersValue, displayCurrency, locale)}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowOrderForm(!showOrderForm)}>
              <Plus className="size-4" />
            </Button>
          </div>

          {showOrderForm && (
            <div className="p-3 rounded-md border bg-secondary/30 grid grid-cols-2 gap-2">
              <Input placeholder={locale === 'ar' ? 'المورد' : 'Supplier'} value={newOrder.supplierName} onChange={(e) => setNewOrder((p) => ({ ...p, supplierName: e.target.value }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'الصنف' : 'Item'} value={newOrder.item} onChange={(e) => setNewOrder((p) => ({ ...p, item: e.target.value }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'الكمية' : 'Quantity'} type="number" value={newOrder.quantity} onChange={(e) => setNewOrder((p) => ({ ...p, quantity: Number(e.target.value) || 0 }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'التكلفة الإجمالية' : 'Total cost'} type="number" value={newOrder.totalCost ? (newOrder.totalCost / cur.rateToYER).toFixed(2) : ''} onChange={(e) => setNewOrder((p) => ({ ...p, totalCost: Number(e.target.value) * cur.rateToYER }))} className="text-sm" />
              <Input placeholder={locale === 'ar' ? 'التاريخ' : 'Date'} type="date" value={newOrder.date} onChange={(e) => setNewOrder((p) => ({ ...p, date: e.target.value }))} className="text-sm" />
              <div className="col-span-2 flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowOrderForm(false)}>{t('cancel')}</Button>
                <Button size="sm" onClick={addOrder}>{t('save')}</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(resources.purchaseOrders ?? []).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">{locale === 'ar' ? 'لا توجد طلبات' : 'No orders'}</div>
            ) : (
              (resources.purchaseOrders ?? []).map((o: PurchaseOrder) => (
                <div key={o.id} className="p-2 rounded-md border bg-background/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{o.item}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.supplierName} • {o.quantity} • {formatCurrency(o.totalCost, displayCurrency, locale)} • {o.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Select value={o.status} onValueChange={(v) => updateOrderStatus(o.id, v as PurchaseOrder['status'])}>
                        <SelectTrigger className="h-6 text-[10px] w-20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">{locale === 'ar' ? 'معلق' : 'Pending'}</SelectItem>
                          <SelectItem value="received">{locale === 'ar' ? 'مستلم' : 'Received'}</SelectItem>
                          <SelectItem value="cancelled">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" className="size-6 p-0 text-destructive" onClick={() => deleteOrder(o.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* الحقول المخصصة */}
        <TabsContent value="custom" className="space-y-3 mt-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              <Settings2 className="size-4 text-purple-600" />
              {locale === 'ar' ? 'الحقول المخصصة' : 'Custom Fields'}
            </h3>
            <Button size="sm" variant="outline" onClick={() => setShowFieldForm(!showFieldForm)}>
              <Plus className="size-4" />
            </Button>
          </div>

          {showFieldForm && (
            <div className="p-3 rounded-md border bg-secondary/30 grid grid-cols-2 gap-2">
              <Input placeholder={locale === 'ar' ? 'اسم الحقل' : 'Field label'} value={newField.label} onChange={(e) => setNewField((p) => ({ ...p, label: e.target.value }))} className="text-sm" />
              <Select value={newField.type} onValueChange={(v) => setNewField((p) => ({ ...p, type: v as any }))}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text"><Type className="size-3 me-1 inline" /> {locale === 'ar' ? 'نص' : 'Text'}</SelectItem>
                  <SelectItem value="number"><Hash className="size-3 me-1 inline" /> {locale === 'ar' ? 'رقم' : 'Number'}</SelectItem>
                  <SelectItem value="date"><Calendar className="size-3 me-1 inline" /> {locale === 'ar' ? 'تاريخ' : 'Date'}</SelectItem>
                  <SelectItem value="textarea">{locale === 'ar' ? 'نص طويل' : 'Long text'}</SelectItem>
                </SelectContent>
              </Select>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setShowFieldForm(false)}>{t('cancel')}</Button>
                <Button size="sm" onClick={addField}>{t('save')}</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {customFields.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">{locale === 'ar' ? 'لا توجد حقول مخصصة' : 'No custom fields'}</div>
            ) : (
              customFields.map((f) => (
                <div key={f.id} className="p-2 rounded-md border bg-background/50">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px]">{f.type}</Badge>
                      <span className="font-medium text-sm">{f.label}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="size-6 p-0 text-destructive" onClick={() => deleteField(f.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                  {f.type === 'textarea' ? (
                    <Textarea value={f.value ?? ''} onChange={(e) => updateFieldValue(f.id, e.target.value)} rows={2} className="text-sm" />
                  ) : (
                    <Input
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      value={f.value ?? ''}
                      onChange={(e) => updateFieldValue(f.id, f.type === 'number' ? Number(e.target.value) || 0 : e.target.value)}
                      className="text-sm"
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
