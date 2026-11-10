from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: str | None = None
    color: str = Field(default="#3B82F6", max_length=20)
    icon: str = Field(default="tag", max_length=50)

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str | None = Field(None, max_length=100)
    description: str | None = None
    color: str | None = Field(None, max_length=20)
    icon: str | None = Field(None, max_length=50)

class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime
