import { DataTypes } from "sequelize"

export const auditColumns = {
  created_by: {
    type: DataTypes.CHAR(32),
    allowNull: true,
    comment:
      "User aplikasi yang membuat baris; NULL untuk data hasil import CSV",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_by: {
    type: DataTypes.CHAR(32),
    allowNull: true,
    comment: "User aplikasi yang terakhir mengubah baris",
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deleted_by: {
    type: DataTypes.CHAR(32),
    allowNull: true,
    comment: "User aplikasi yang melakukan soft delete",
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}
