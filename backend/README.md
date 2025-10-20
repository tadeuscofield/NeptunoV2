# NEPTUNO Backend

Flask API + PostgreSQL

## Deploy Railway

1. Import repositório
2. Root Directory: `backend`
3. Add PostgreSQL
4. Deploy automático!

## Endpoints

- `GET /` - Info da API
- `GET /health` - Health check
- `POST /api/predict` - Predição ML
- `POST /api/pdi` - Salvar PDI
- `GET /api/pdi` - Listar PDIs
- `GET /api/stats` - Estatísticas

## Local

```bash
pip install -r requirements.txt
python app.py
```
