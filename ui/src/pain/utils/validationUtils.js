import React, { Component } from 'react';

export function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}
