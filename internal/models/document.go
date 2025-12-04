package models

import "time"

type DocumentType string

const (
	DocTypePitchDeck DocumentType = "pitch_deck"
	DocTypePAndL     DocumentType = "p_and_l"
	DocTypeLegal     DocumentType = "legal"
	DocTypeOther     DocumentType = "other"
)

type Document struct {
	ID        uint             `gorm:"primaryKey"`
	CompanyID uint             `gorm:"not null;index"`
	Company   PortfolioCompany `gorm:"foreignKey:CompanyID"`

	FileName string       `gorm:"not null"`
	FileType DocumentType `gorm:"type:varchar(50);not null"`
	FileSize int64        // Size in bytes
	FilePath string       `gorm:"not null"` // S3 path or local path
	MimeType string

	Description string `gorm:"type:text"`
	UploadedBy  string // Email of uploader

	CreatedAt time.Time
	UpdatedAt time.Time
}
