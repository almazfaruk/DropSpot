import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from unittest.mock import MagicMock
from app.main import admin_create_drop
from app import schemas, crud

def test_admin_create_drop_unit():
    mock_db = MagicMock()

    drop_in = schemas.DropCreate(
        title="Unit Test Drop",
        description="Unit test description",
        remaining_slots=5
    )

    crud.create_drop = MagicMock(return_value={
        "id": "123",
        "title": drop_in.title,
        "description": drop_in.description,
        "remaining_slots": drop_in.remaining_slots
    })

    result = admin_create_drop(drop_in, admin=True, db=mock_db)

    assert result["title"] == "Unit Test Drop"
    assert result["remaining_slots"] == 5
    crud.create_drop.assert_called_once_with(mock_db, drop_in.dict())
