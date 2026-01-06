'use client';

import { useState, useEffect } from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

type MenuItem = {
  key: string;
  label: string;
  title?: string;
  children?: MenuItem[];
};

type CustomSidebarMenuProps = {
  items: MenuItem[];
  selectedKey: string;
  defaultOpenKeys?: string[];
  onSelect: (key: string, item: MenuItem) => void;
};

export const CustomSidebarMenu = ({
  items,
  selectedKey,
  defaultOpenKeys = [],
  onSelect,
}: CustomSidebarMenuProps) => {
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);

  useEffect(() => {
    setOpenKeys(defaultOpenKeys);
  }, []);

  const toggleSubmenu = (key: string) => {
    setOpenKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  const isOpen = (key: string) => openKeys.includes(key);
  const isSelected = (key: string) => selectedKey === key;

  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleSubmenu(item.key);
    } else {
      onSelect(item.key, item);
    }
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const open = isOpen(item.key);
    const selected = isSelected(item.key);

    return (
      <div key={item.key} className="custom-menu-item-wrapper">
        <div
          className={`custom-menu-item ${isChild ? 'custom-menu-item-child' : ''} ${
            selected && !hasChildren ? 'custom-menu-item-selected' : ''
          } ${hasChildren && open ? 'custom-menu-item-open' : ''}`}
          onClick={() => handleItemClick(item)}
        >
          <span className="custom-menu-item-label">{item.label}</span>
          {hasChildren && (
            <span className="custom-menu-item-arrow">
              {open ? <DownOutlined /> : <RightOutlined />}
            </span>
          )}
        </div>

        {hasChildren && (
          <div
            className={`custom-menu-submenu ${open ? 'custom-menu-submenu-open' : ''}`}
          >
            {item.children!.map((child) => renderMenuItem(child, true))}
          </div>
        )}

        <style jsx>{`
          .custom-menu-item-wrapper {
            margin: 6px 0;
          }

          .custom-menu-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            height: 52px;
            border-radius: 12px;
            cursor: pointer;
            color: #6b7280;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.2s ease;
            user-select: none;
          }

          .custom-menu-item:hover {
            background: #f3f4f6;
            color: #00bcd4;
          }

          .custom-menu-item-open {
            color: #00bcd4;
          }

          .custom-menu-item-selected {
            background: #00bcd4 !important;
            color: white !important;
            box-shadow: 0 6px 16px rgba(0, 188, 212, 0.4);
          }

          .custom-menu-item-selected:hover {
            background: #00bcd4 !important;
            color: white !important;
          }

          .custom-menu-item-child {
            padding-left: 32px;
            height: 44px;
            font-size: 14px;
          }

          .custom-menu-item-label {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .custom-menu-item-arrow {
            font-size: 12px;
            transition: transform 0.2s ease;
          }

          .custom-menu-submenu {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
          }

          .custom-menu-submenu-open {
            max-height: 500px;
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="custom-sidebar-menu">
      {items.map((item) => renderMenuItem(item))}
    </div>
  );
};
