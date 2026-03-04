from dataclasses import dataclass
from typing import Any


@dataclass
class CreatePrRequest:
    created_by: str
    modified_by: str
    title: str
    department: str
    justification: str
    items: list[dict[str, Any]]
    needed_by: str | None = None
    vendor: str | None = None
    currency: str = 'MYR'


@dataclass
class CreatePrResponse:
    id: str
    created_by: str
    modified_by: str
    title: str
    department: str
    justification: str
    needed_by: str | None
    vendor: str | None
    currency: str
    status: str
    item_count: int
    total_amount: float
    created_at: str
    updated_at: str
