import { Component, OnInit } from '@angular/core';
import * as models from './../models';
import * as radweb from 'radweb';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  selectCustomerGrid = new radweb.GridSettings(new models.Customers(),
    {

      numOfColumnsInGrid: 4,
      columnSettings: customers => [
        customers.id,
        customers.companyName,
        customers.contactName,
        customers.country,
        customers.address,
        customers.city
      ]
    });
  ordersGrid = new radweb.GridSettings<models.Orders>(new models.Orders(),
    {
      get: {
        limit: 25
      },
      knowTotalRows: true,
      numOfColumnsInGrid: 4,
      allowUpdate: true,

      allowInsert: true,
      onEnterRow: orders =>
        this.orderDetailsGrid.get({
          where: orderDetails =>
            orderDetails.orderID.isEqualTo(orders.id),
          limit: 50
        }),
      columnSettings: orders => [
        {
          column: orders.id,
          width: '90px',
          readonly: true,
        },
        {
          column: orders.customerID,
          width: '400px',
          getValue: orders =>
            orders.lookup(new models.Customers(), orders.customerID).companyName,
          click: orders =>
            this.selectCustomerGrid.showSelectPopup(
              selectedCustomer =>
                orders.customerID.value = selectedCustomer.id.value)
        },
        {
          column: orders.orderDate,
          width:'170px'
        },
        {
          column: orders.shipVia,
          width: '150px',
          dropDown: {
            source: new models.Shippers()
          }
        },

      ],
      rowButtons: [
        {
          click: orders =>
            window.open(
              environment.serverUrl + 'home/print/' + orders.id.value),
          cssClass: 'btn btn-primary glyphicon glyphicon-print'
        }
      ],
    }
  );
  shipInfoArea = this.ordersGrid.addArea({
    numberOfColumnAreas: 2,
    columnSettings: orders => [
      orders.requiredDate,
      orders.shippedDate,
      orders.shipAddress,
      orders.shipCity
    ]
  });
  orderDetailsGrid = new radweb.GridSettings<models.OrderDetails>(new models.OrderDetails(),
    {
      allowUpdate: true,
      allowDelete: true,
      allowInsert: true,
      knowTotalRows: true,
      columnSettings: order_details => [
        {
          column: order_details.productID,
          width: '300px',
          dropDown: {
            source: new models.Products()
          }
        }, {
          column: order_details.unitPrice,
          width: '100px'
        },
        {
          column: order_details.quantity, width: '100px'
        },
        {
          caption: 'Total',
          width: '100px',
          getValue: orderDetails =>
            (orderDetails.quantity.value * orderDetails.unitPrice.value).toFixed(2)
        }
      ],
      onNewRow: orderDetail => {
        orderDetail.orderID.value = this.ordersGrid.currentRow.id.value;
        orderDetail.quantity.value = 1;
      },

    });
  getOrderTotal() {
    let result = 0;
    this.orderDetailsGrid.items.forEach(
      orderDetail =>
        result += orderDetail.quantity.value * orderDetail.unitPrice.value);
    return result.toFixed(2);
  }
  printCurrentOrder() {
    window.open(
      environment.serverUrl + 'home/print/' + this.ordersGrid.currentRow.id.value);
  }

}
