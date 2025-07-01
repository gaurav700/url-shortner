# URL Shortener Service

A simple and efficient URL shortener service built with Node.js, Express, and SQLite. This service generates short URLs using SHA-256 hashing and Base62 encoding, with automatic expiration after 30 days.

## Features

- 🔗 Generate short URLs from long URLs
- 📊 Base62 encoding for compact URLs
- ⏰ Automatic URL expiration (30 days)
- 🗄️ In-memory SQLite database
- 🚀 Fast redirection service
- 💾 Persistent storage during runtime
- 🔒 SHA-256 based URL generation

## Architecture Overview

![Architecture Diagram](https://excalidraw.com/#json=7KOMtpb2lfjODoLroT72v,IHrix_Tav_j8-0Z_SZlxlQ)

*Note: Replace the above link with your actual Excalidraw diagram*

## API Endpoints

### Health Check
```
GET /health
```
Returns service status.

**Response:**
```
OK
```

### Generate Short URL
```
POST /generate
```

**Request Body:**
```json
{
  "url": "https://example.com/very/long/url/path"
}
```

**Response:**
```json
{
  "short_url": "abc123D",
  "created_at": "2025-07-01T12:00:00.000Z",
  "expires_at": "2025-07-31T12:00:00.000Z",
  "long_url": "https://example.com/very/long/url/path"
}
```

### Redirect to Original URL
```
GET /:shortUrl
```

Redirects to the original long URL if the short URL exists and hasn't expired.

**Example:**
```
GET /abc123D → Redirects to https://example.com/very/long/url/path
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd url-shortener
```

2. Install dependencies:
```bash
npm install express sqlite3 base-x
```

3. Start the server:
```bash
npm start
```

The server will start on port 3000 by default, or use the `PORT` environment variable.

## Usage Examples

### Using cURL

**Generate a short URL:**
```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.google.com"}'
```

**Access the short URL:**
```bash
curl -L http://localhost:3000/abc123D
```

### Using JavaScript (fetch)

```javascript
// Generate short URL
const response = await fetch('http://localhost:3000/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://www.example.com'
  })
});

const data = await response.json();
console.log('Short URL:', data.short_url);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NAME` | Welcome message name | `World` |

## Database Schema

The service uses an in-memory SQLite database with the following schema:

```sql
CREATE TABLE shorturls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_url TEXT NOT NULL,
  long_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT
);
```

## How It Works

1. **URL Hashing**: The service uses SHA-256 to hash the input URL
2. **Base62 Encoding**: The hash is encoded using Base62 (0-9, a-z, A-Z) for compact representation
3. **Short Code Generation**: First 7 characters of the encoded hash become the short URL
4. **Storage**: URL mappings are stored in an in-memory SQLite database
5. **Expiration**: URLs automatically expire after 30 days
6. **Redirection**: When accessing a short URL, the service looks up the original URL and redirects

## Technical Details

### Dependencies
- **express**: Web framework for Node.js
- **sqlite3**: SQLite database driver
- **base-x**: Base encoding/decoding library
- **crypto**: Built-in Node.js cryptographic functionality

### URL Generation Algorithm
```javascript
function generateShortUrl(longUrl) {
  const hash = crypto.createHash('sha256').update(longUrl).digest();
  return base62.encode(hash).substring(0, 7);
}
```

### Key Features
- **Deterministic**: Same long URL always generates the same short URL
- **Collision Resistant**: SHA-256 provides excellent collision resistance
- **Compact**: Base62 encoding creates shorter, URL-friendly strings
- **Automatic Cleanup**: URLs expire after 30 days

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (missing URL)
- `404`: Short URL not found
- `500`: Internal Server Error

## Limitations

- **In-Memory Database**: Data is lost when the server restarts
- **No User Management**: No authentication or user-specific URLs
- **Fixed Expiration**: All URLs expire after 30 days
- **No Analytics**: No tracking of URL usage statistics

## Future Enhancements

- [ ] Persistent database (PostgreSQL/MySQL)
- [ ] Custom expiration dates
- [ ] User authentication and management
- [ ] Click analytics and statistics
- [ ] Custom short URL aliases
- [ ] Bulk URL generation
- [ ] API rate limiting
- [ ] URL validation and safety checks

## Development

### Running in Development
```bash
# Install dependencies
npm install

# Start with auto-reload (using nodemon)
npm run dev

# Or start normally
npm start
```

### Testing
```bash
# Test the health endpoint
curl http://localhost:3000/health

# Test URL generation
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This is a demonstration project. For production use, consider implementing additional security measures, persistent storage, and proper error handling.