import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaGripLines, FaPen, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';

const SortableItem = ({ point, index, onRename, onDelete, onToggleExcluded }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: point.id });
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(point.name || '');
  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleBlur = () => {
    setIsEditing(false);
    if (newName.trim() && newName.trim() !== point.name) onRename(point.id, newName.trim());
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 p-2 rounded border mb-1 ${point.excluded ? 'bg-gray-200 opacity-70' : 'bg-gray-50'}`}>
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600"><FaGripLines size={14} /></div>
      {isEditing ? (
        <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} onBlur={handleBlur} onKeyDown={(e) => e.key === 'Enter' && handleBlur()} className="flex-1 text-sm border rounded p-1" />
      ) : (
        <>
          <span className="flex-1 text-sm truncate">{point.name || `Точка ${index + 1}`}</span>
          {point.comment && <span className="text-xs text-gray-500" title={point.comment}>💬</span>}
          <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-gray-600" title="Переименовать"><FaPen size={12} /></button>
        </>
      )}
      <button onClick={() => onToggleExcluded(point.id)} className="text-gray-500 hover:text-gray-700" title={point.excluded ? 'Включить в маршрут' : 'Исключить из маршрута'}>
        {point.excluded ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
      </button>
      <button onClick={() => onDelete(point.id)} className="text-red-400 hover:text-red-600" title="Удалить точку"><FaTrash size={12} /></button>
    </div>
  );
};

const RouteList = ({ points, onReorder, onRename, onDelete, onToggleExcluded }) => {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = points.findIndex(p => p.id === active.id);
      const newIndex = points.findIndex(p => p.id === over.id);
      onReorder(arrayMove(points, oldIndex, newIndex));
    }
  };
  if (points.length === 0) return <p className="text-sm text-gray-500">Нет точек маршрута</p>;
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={points.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="max-h-60 overflow-y-auto">
          {points.map((point, idx) => (
            <SortableItem
              key={point.id}
              point={point}
              index={idx}
              onRename={onRename}
              onDelete={onDelete}
              onToggleExcluded={onToggleExcluded}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default RouteList;