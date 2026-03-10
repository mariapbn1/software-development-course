import openpyxl

from rest_framework.views import APIView
from django.http import HttpResponse, HttpResponseBadRequest
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors

from api.comments.models import Comment
from api.products.models import Product


class DynamicReportView(APIView):
    def get(self, request):
        report_type = request.query_params.get('type')
        file_format = request.query_params.get('formate')

        if not report_type or not file_format:
            return HttpResponseBadRequest("Debes especificar 'tipo' (productos/comentarios) y 'formato' (pdf/excel)")

        if report_type == 'productos':
            headers = ['Nombre', 'Marca', 'RAM', 'Almacenamiento']
            queryset = Product.objects.all().select_related('brand')
            data = [[p.name, p.brand.name, p.ram, p.storage] for p in queryset]
            filename = "reporte_productos"

        elif report_type == 'comentarios':
            headers = ['Producto', 'Usuario', 'Fecha', 'Comentario']
            queryset = Comment.objects.all().select_related('product', 'user')
            data = [[c.product.name, c.user.username, str(c.date), c.comment[:30]] for c in queryset]
            filename = "reporte_comentarios"

        else:
            return HttpResponseBadRequest("Tipo de reporte no válido")

        if file_format == 'excel':
            return self.generate_excel(headers, data, filename)
        elif file_format == 'pdf':
            return self.generate_pdf(headers, data, filename)
        else:
            return HttpResponseBadRequest("Formato no soportado (usa 'pdf' o 'excel')")

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
        response['Content-Disposition'] = f'attachment; filename="reports/{filename}.pdf"'

        doc = SimpleDocTemplate(response, pagesize=letter)
        full_data = [headers] + data

        table = Table(full_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))

        doc.build([table])
        return response