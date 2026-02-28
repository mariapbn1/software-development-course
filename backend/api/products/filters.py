import django_filters

from .models import Product


class NumberInFilter(
    django_filters.BaseInFilter,
    django_filters.NumberFilter
):
    pass


class CharInFilter(
    django_filters.BaseInFilter,
    django_filters.CharFilter
):
    pass


class BooleanInFilter(django_filters.Filter):

    def filter(self, qs, value):

        if value in (None, ""):
            return qs

        # ensure list
        if isinstance(value, str):
            value = value.split(",")

        bool_values = []

        for v in value:
            if str(v).lower() in ["1", "true"]:
                bool_values.append(True)
            elif str(v).lower() in ["0", "false"]:
                bool_values.append(False)

        if not bool_values:
            return qs

        return qs.filter(**{
            f"{self.field_name}__in": bool_values
        })


class DateInFilter(
    django_filters.BaseInFilter,
    django_filters.DateFilter
):
    pass


# ---------- PRODUCT FILTER ----------

class ProductFilter(django_filters.FilterSet):
    # Relations
    brand = NumberInFilter(
        field_name="brand__id",
        lookup_expr="in"
    )

    operating_system = NumberInFilter(
        field_name="operating_system__id",
        lookup_expr="in"
    )

    max_supported_network = NumberInFilter(
        field_name="max_supported_network__id",
        lookup_expr="in"
    )

    color = NumberInFilter(
        field_name="color__id",
        lookup_expr="in"
    )

    # Numeric fields
    ram = NumberInFilter(
        field_name="ram",
        lookup_expr="in"
    )

    storage = NumberInFilter(
        field_name="storage",
        lookup_expr="in"
    )

    max_battery = NumberInFilter(
        field_name="max_battery",
        lookup_expr="in"
    )

    main_camera_res = NumberInFilter(
        field_name="main_camera_res",
        lookup_expr="in"
    )

    selfie_camera_res = NumberInFilter(
        field_name="selfie_camera_res",
        lookup_expr="in"
    )

    # Dates
    release_year = NumberInFilter(
        field_name="release_date__year",
        lookup_expr="in"
    )

    # Boolean
    has_nfc = BooleanInFilter(
        field_name="has_nfc"
    )

    has_headphone_jack = BooleanInFilter(
        field_name="has_headphone_jack"
    )

    class Meta:
        model = Product
        fields = [
            'brand', 'operating_system', 'max_supported_network',
            'color', 'ram', 'storage', 'max_battery', 'main_camera_res',
            'selfie_camera_res', 'release_date', 'has_nfc', 'has_headphone_jack'
        ]
