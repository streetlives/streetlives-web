import React, { Component } from 'react';
import { Row, Col } from '../../../components/layout/bootstrap';
import Input from '../../../components/input';
import Button from '../../../components/button';

export default function OpeningHoursEditForm({active}){
  return  <form 
    className="container" 
    style={{
      backgroundColor:'#f0f0f0', 
      padding: '.5em', 
      marginBottom:'10px', 
      display: active ? 'block' : 'none' 
    }}>
    <table> 
      <tr>
        <td style={{paddingRight: '1em'}}>From</td>
        <td><Input type="time"/></td>
      </tr>
      <tr>
        <td>To</td>
        <td><Input type="time"/></td>
      </tr>
    </table> 
  </form>;
}
