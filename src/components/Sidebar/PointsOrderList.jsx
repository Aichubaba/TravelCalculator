import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaTrash, FaPen, FaGripLines } from 'react-icons/fa';

const SortableItem = ({ point, onRename, onDelete, darkMode }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(point.name || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: point.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleBlur = () => {
    setEditing(false);
    if (name.trim() && name !== point.name) {
      onRename(point.id, name.trim());
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded text-sm ${
        darkMode ? 'bg-gray-800 text-white' : 'bg-white/50 text-gray-900'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-gray-700">
        <FaGripLines size={14} />
      </div>
      {editing ? (
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => { if (e.key === 'Enter') handleBlur(); }}
          className="flex-1 border px-2 py-1 rounded text-sm bg-white dark:bg-gray-700"
        />
      ) : (
        <span className="flex-1 truncate">{point.name}</span>
      )}
      <button onClick={() => { setEditing(true); setName(point.name || ''); }} className="text-gray-500 hover:text-blue-600" title="Переименовать">
        <FaPen size={12} />
      </button>
      <button onClick={() => onDelete(point.id)} className="text-red-500 hover:text-red-700" title="Удалить">
        <FaTrash size={12} />
      </button>
    </div>
  );
};

const PointsOrderList = ({ points, onReorder, onRename, onDelete, darkMode }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = points.findIndex((p) => p.id === active.id);
      const newIndex = points.findIndex((p) => p.id === over.id);
      const newPoints = arrayMove(points, oldIndex, newIndex);
      onReorder(newPoints);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={points.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {points.map((point, index) => (
            <SortableItem key={point.id} point={point} onRename={onRename} onDelete={onDelete} darkMode={darkMode} />
          ))}
          {points.length === 0 && <p className="text-xs text-gray-500">Нет точек</p>}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default PointsOrderList;