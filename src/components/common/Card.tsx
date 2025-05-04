import React from 'react';
import { Element } from 'react-scroll';

interface CardProps {
  title: string;
  children: React.ReactNode;
  id: string;
}

const Card: React.FC<CardProps> = ({ title, children, id }) => (
  <Element name={id} className="bg-gray-700 dark:bg-white rounded-lg p-4 space-y-3">
    <h3 className="text-sm font-medium text-gray-300 dark:text-gray-700">{title}</h3>
    {children}
  </Element>
);

export default Card;