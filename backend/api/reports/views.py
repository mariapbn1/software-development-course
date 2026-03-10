import openpyxl

from rest_framework.views import APIView
from django.http import HttpResponse, HttpResponseBadRequest
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors

from api.comments.models import Comment
from api.products.models import Product


class DynamicReportView(APIView):
    def get(self, request):
        report_type = request.query_params.get('type')
        file_format = request.query_params.get('formate')

        if not report_type or not file_format:
            return HttpResponseBadRequest("You must specify 'type' (products/comments) and 'formate' (pdf/Excel)")

        if report_type == 'products':
            headers = [
                'Nombre', 'Almacenamiento', 'RAM', 'Fecha de Lanzamiento', 'Batería',
                'Resolución Cámara Principal', 'Resolución Cámara Selfie', 'NFC', 'Conector para Auriculares',
                'Sinópsis', 'Marca', 'Color', 'Red', 'Sistema Operativo'
            ]
            queryset = Product.objects.all().select_related('brand')
            data = [
                [
                    p.name, p.storage, p.ram, p.release_date, p.max_battery, p.main_camera_res,
                    p.selfie_camera_res, p.has_nfc, p.has_headphone_jack, p.synopsis,
                    p.brand.name, p.color.name, p.max_supported_network.name, p.operating_system.name
                ] for p in queryset]

            filename = "reporte_productos"

        elif report_type == 'comments':
            headers = ['Producto', 'Usuario', 'Fecha', 'Comentario']
            queryset = Comment.objects.all().select_related('product', 'user')
            data = [[c.product.name, c.user.username, c.user.email, str(c.date), c.comment[:30]] for c in queryset]
            filename = "reporte_comentarios"

        else:
            return HttpResponseBadRequest("Invalid type of report")

        if file_format == 'excel':
            return self.generate_excel(headers, data, filename)
        elif file_format == 'pdf':
            return self.generate_pdf(headers, data, filename)
        else:
            return HttpResponseBadRequest("Format not supported (use 'pdf' or 'excel')")

    def generate_excel(self, headers, data, filename):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.append(headers)
        for row in data:
            ws.append(row)

        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = f'attachment; filename="reports/{filename}.xlsx"'
        wb.save(response)
        return response

    def generate_pdf(self, headers, data, filename):
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'

        doc = SimpleDocTemplate(response, pagesize=landscape(letter))
        doc.title = filename
        elements = []

        styles = getSampleStyleSheet()
        style_body = styles["BodyText"]
        style_body.fontSize = 7

        style_header = styles["Heading4"]
        style_header.fontSize = 8
        style_header.textColor = colors.whitesmoke

        processed_data = []

        processed_headers = [Paragraph(h, style_header) for h in headers]
        processed_data.append(processed_headers)

        for row in data:
            new_row = []
            for i, item in enumerate(row):
                if i == 9:
                    new_row.append(Paragraph(str(item), style_body))
                elif isinstance(item, bool):
                    new_row.append("Sí" if item else "No")
                else:
                    new_row.append(Paragraph(str(item), style_body))
            processed_data.append(new_row)

        table = Table(processed_data, repeatRows=1)

        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.3, colors.grey),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3),
        ]))

        elements.append(table)
        doc.build(elements)
        return response
