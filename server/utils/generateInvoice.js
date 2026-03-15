import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateInvoice = (order, invoicePath) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });

        const stream = fs.createWriteStream(invoicePath);
        doc.pipe(stream);

        // Header
        doc.fillColor('#000000')
            .fontSize(22)
            .font('Helvetica-Bold')
            .text('ZAIN FABRICS', 50, 50)
            .fontSize(10)
            .font('Helvetica')
            .text('1/106-B, DR THOTTAM, ELLAPALAYAM PERIVU', 50, 75)
            .text('KANJIKOVIL ROAD, KARUMANDISELLIPALAYAM', 50, 88)
            .text('PERUNDURAI, Erode, Tamil Nadu - 638052', 50, 101)
            .text('GSTIN: 33AFXPP3597B1Z0', 50, 114);

        doc.fontSize(10)
            .text('Email: support@zainfabrics.com', 200, 75, { align: 'right' })
            .text('Phone: +91 97893 54884', 200, 88, { align: 'right' })
            .text('Website: www.zainfabrics.com', 200, 101, { align: 'right' });

        doc.moveTo(50, 135).lineTo(550, 135).stroke();

        // Invoice Info
        doc.fillColor('#000000')
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('TAX INVOICE', 50, 160);

        doc.fontSize(10)
            .font('Helvetica')
            .text(`Invoice No: INV-${order._id.toString().substring(0, 8).toUpperCase()}`, 50, 195)
            .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 50, 210)
            .text(`Order ID: #${order._id.toString().substring(0, 8).toUpperCase()}`, 50, 225)
            .text(`Payment: ${order.paymentMethod}`, 50, 240);

        // Billing To
        doc.font('Helvetica-Bold')
            .text('BILL TO:', 300, 195)
            .font('Helvetica')
            .text(order.user?.name || 'Customer', 300, 210)
            .text(order.billingAddress.address, 300, 225)
            .text(`${order.billingAddress.city}, ${order.billingAddress.postalCode}`, 300, 240)
            .text(`${order.billingAddress.country}`, 300, 255)
            .text(`Phone: ${order.billingAddress.phone || 'N/A'}`, 300, 270);

        // Table Header
        const tableTop = 330;
        doc.font('Helvetica-Bold');
        doc.text('Item Description', 50, tableTop)
            .text('HSN', 240, tableTop)
            .text('Price (INR)', 300, tableTop, { width: 80, align: 'right' })
            .text('Qty', 400, tableTop, { width: 50, align: 'right' })
            .text('Total (INR)', 0, tableTop, { align: 'right' });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).lineWidth(1).stroke();

        // Table Rows
        let i = 0;
        let position = 0;
        doc.font('Helvetica');

        order.orderItems.forEach((item) => {
            position = tableTop + 30 + (i * 30);
            const itemName = item.type === 'sample' ? `${item.name} (Sample)` : item.name;
            doc.fontSize(10)
                .text(itemName.substring(0, 35), 50, position)
                .text('5903', 240, position) // Standard HSN for Laminated Fabrics
                .text(item.price.toFixed(2), 300, position, { width: 80, align: 'right' })
                .text(item.quantity, 400, position, { width: 50, align: 'right' })
                .text((item.price * item.quantity).toFixed(2), 0, position, { align: 'right' });

            i++;
        });

        // Totals
        const summaryTop = position + 50;
        doc.moveTo(350, summaryTop).lineTo(550, summaryTop).stroke();

        doc.font('Helvetica-Bold');
        doc.text('Subtotal', 350, summaryTop + 15, { width: 100, align: 'left' })
            .font('Helvetica')
            .text(`INR ${order.itemsPrice.toFixed(2)}`, 0, summaryTop + 15, { align: 'right' });

        doc.font('Helvetica-Bold')
            .text('GST (18%)', 350, summaryTop + 35, { width: 100, align: 'left' })
            .font('Helvetica')
            .text(`INR ${order.taxPrice.toFixed(2)}`, 0, summaryTop + 35, { align: 'right' });

        doc.fontSize(12).font('Helvetica-Bold')
            .text('Grand Total', 350, summaryTop + 60, { width: 100, align: 'left' })
            .text(`INR ${order.totalPrice.toFixed(2)}`, 0, summaryTop + 60, { align: 'right' });

        // Terms
        doc.fontSize(8).font('Helvetica-Oblique').fillColor('#666666')
            .text('Terms & Conditions:', 50, 680)
            .text('1. Goods once sold cannot be returned.', 50, 695)
            .text('2. This is a computer generated invoice and does not require a physical signature.', 50, 710);

        // Footer
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000')
            .text('Thank you for choosing ZAIN FABRICS.', 50, 750, { align: 'center', width: 500 });

        doc.end();

        stream.on('finish', () => resolve(true));
        stream.on('error', (err) => reject(err));
    });
};
