import django_filters
from .models import Product


# ---------- GENERIC IN FILTERS ----------

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


class BooleanInFilter(
    django_filters.BaseInFilter,
    django_filters.BooleanFilter
):
    pass


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
    release_date = DateInFilter(
        field_name="release_date",
        lookup_expr="in"
    )

    # Boolean
    has_nfc = BooleanInFilter(
        field_name="has_nfc",
        lookup_expr="in"
    )

    has_headphone_jack = BooleanInFilter(
        field_name="has_headphone_jack",
        lookup_expr="in"
    )

    class Meta:
        model = Product
        fields = "__all__"