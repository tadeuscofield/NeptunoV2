"""
NEPTUNO ML API - Flask Backend
Deploy: Railway.app
Database: PostgreSQL
Version: 2.2.0 - Trial System
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from datetime import datetime, timedelta
import secrets
import string
import resend

app = Flask(__name__)
CORS(app)

# Email Configuration (Resend API - works on Railway)
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
resend.api_key = RESEND_API_KEY
FROM_EMAIL = 'NEPTUNO <contato@neptunodescom.com>'  # Domínio verificado

# PostgreSQL (Railway auto-configura DATABASE_URL)
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL or 'sqlite:///local.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ==========================================
# MODELS
# ==========================================

class PDI(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome_operador = db.Column(db.String(200))
    nome_instalacao = db.Column(db.String(200))
    bacia = db.Column(db.String(100))
    custo_total = db.Column(db.Float)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'nome_operador': self.nome_operador,
            'nome_instalacao': self.nome_instalacao,
            'bacia': self.bacia,
            'custo_total': self.custo_total,
            'data_criacao': self.data_criacao.isoformat()
        }

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    profundidade_lamina = db.Column(db.Float)
    numero_pocos = db.Column(db.Integer)
    custo_predito = db.Column(db.Float)
    data_predicao = db.Column(db.DateTime, default=datetime.utcnow)

class TrialUser(db.Model):
    """Usuários em trial de 72h"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    company = db.Column(db.String(200))
    position = db.Column(db.String(200))
    phone = db.Column(db.String(50))

    # Trial info
    access_code = db.Column(db.String(20), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    activated_at = db.Column(db.DateTime, nullable=True)
    expires_at = db.Column(db.DateTime, nullable=True)

    # Status
    status = db.Column(db.String(20), default='PENDING')  # PENDING, ACTIVE, EXPIRED, CONVERTED
    is_approved = db.Column(db.Boolean, default=True)  # Admin pode rejeitar

    # LGPD
    lgpd_consent = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'company': self.company,
            'position': self.position,
            'access_code': self.access_code,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'activated_at': self.activated_at.isoformat() if self.activated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_active': self.is_active()
        }

    def is_active(self):
        """Verifica se trial está ativo"""
        if not self.is_approved or self.status == 'EXPIRED':
            return False
        if not self.activated_at:
            return False
        if self.expires_at and datetime.utcnow() > self.expires_at:
            self.status = 'EXPIRED'
            db.session.commit()
            return False
        return True

# ==========================================
# ENDPOINTS
# ==========================================

@app.route('/')
def home():
    return jsonify({
        'status': 'online',
        'app': 'NEPTUNO ML API',
        'version': '2.1.0',
        'endpoints': {
            'health': '/health',
            'predict': '/api/predict',
            'pdi': '/api/pdi',
            'stats': '/api/stats'
        }
    })

@app.route('/health')
def health():
    try:
        db.session.execute('SELECT 1')
        db_status = 'healthy'
    except:
        db_status = 'unhealthy'

    return jsonify({
        'status': 'healthy',
        'database': db_status,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        # Cálculo simplificado (substitua por modelo ML real depois)
        custo_base = 35000000  # R$ 35M por poço
        numero_pocos = int(data.get('numero_pocos', 0))
        profundidade = float(data.get('profundidade_lamina', 1000))

        fator_lamina = 1 + (profundidade / 3000) * 0.5
        custo_total = custo_base * numero_pocos * fator_lamina

        # Salvar predição
        prediction = Prediction(
            profundidade_lamina=profundidade,
            numero_pocos=numero_pocos,
            custo_predito=custo_total
        )
        db.session.add(prediction)
        db.session.commit()

        return jsonify({
            'prediction': {
                'custo_total': custo_total,
                'breakdown': {
                    'custo_por_poco': custo_base * fator_lamina,
                    'numero_pocos': numero_pocos
                }
            },
            'confidence': 75.0,
            'prediction_id': prediction.id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pdi', methods=['POST'])
def save_pdi():
    try:
        data = request.json
        pdi = PDI(
            nome_operador=data.get('nome_operador'),
            nome_instalacao=data.get('nome_instalacao'),
            bacia=data.get('bacia'),
            custo_total=data.get('custo_total')
        )
        db.session.add(pdi)
        db.session.commit()
        return jsonify({'message': 'PDI salvo', 'pdi_id': pdi.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pdi', methods=['GET'])
def list_pdis():
    try:
        pdis = PDI.query.order_by(PDI.data_criacao.desc()).limit(50).all()
        return jsonify({'pdis': [pdi.to_dict() for pdi in pdis]})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def stats():
    try:
        return jsonify({
            'total_pdis': PDI.query.count(),
            'total_predictions': Prediction.query.count(),
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==========================================
# EMAIL FUNCTIONS
# ==========================================

def send_welcome_email(to_email, name, access_code):
    """Envia email de boas-vindas com código de acesso via Resend API"""
    try:
        print(f"[EMAIL] Iniciando envio via Resend para {to_email}")

        # HTML email body
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #0a1929 0%, #1a365d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .code-box {{ background: white; border: 3px dashed #2563eb; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }}
                .code {{ font-size: 32px; font-weight: bold; color: #1a365d; letter-spacing: 2px; }}
                .button {{ display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }}
                .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }}
                .highlight {{ background: #dbeafe; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; border-radius: 4px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 36px;">🔱 NEPTUNO</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema Profissional de Plano de Desativação</p>
                </div>

                <div class="content">
                    <h2 style="color: #1a365d;">Olá, {name}! 👋</h2>

                    <p>Bem-vindo ao <strong>NEPTUNO</strong>! Seu trial de <strong>72 horas</strong> foi aprovado.</p>

                    <div class="code-box">
                        <p style="margin: 0 0 10px 0; color: #666;">Seu Código de Acesso:</p>
                        <div class="code">{access_code}</div>
                    </div>

                    <div class="highlight">
                        <strong>✅ O que você pode fazer agora:</strong>
                        <ul style="margin: 10px 0;">
                            <li>Gerar PDIs completos com ML</li>
                            <li>Exportar relatórios profissionais em PDF</li>
                            <li>Acessar cálculos de custos automáticos</li>
                            <li>Conforme ANP 817/2020</li>
                        </ul>
                    </div>

                    <div style="text-align: center;">
                        <a href="https://neptunodescom.com/app" class="button">🚀 Acessar Sistema</a>
                    </div>

                    <div class="highlight">
                        <strong>📋 Como usar:</strong>
                        <ol style="margin: 10px 0;">
                            <li>Acesse <a href="https://neptunodescom.com/app">neptunodescom.com/app</a></li>
                            <li>Insira seu código: <strong>{access_code}</strong></li>
                            <li>Comece a gerar seus PDIs profissionais</li>
                        </ol>
                    </div>

                    <p style="margin-top: 20px;"><strong>⏰ Seu trial expira em 72 horas</strong></p>
                    <p style="color: #666; font-size: 14px;">Aproveite ao máximo para testar todas as funcionalidades!</p>
                </div>

                <div class="footer">
                    <p><strong>NEPTUNO</strong> - Sistema Profissional de PDI Offshore</p>
                    <p>🌐 <a href="https://neptunodescom.com">neptunodescom.com</a></p>
                    <p>📧 <a href="mailto:contato@neptunodescom.com">contato@neptunodescom.com</a></p>
                    <p style="margin-top: 15px; font-size: 12px; color: #999;">
                        Desenvolvido por <strong>Eng. Tadeu Santana</strong><br>
                        100% LGPD Compliant | Conforme ANP 817/2020
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        # Send email via Resend API
        print(f"[EMAIL] Enviando via Resend API...")
        params = {
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": f"🔱 Seu código de acesso trial NEPTUNO - {access_code}",
            "html": html_body
        }

        response = resend.Emails.send(params)
        print(f"[EMAIL] Email enviado com sucesso! ID: {response.get('id', 'N/A')}")

        return True

    except Exception as e:
        print(f"[EMAIL] ERRO ao enviar email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# ==========================================
# TRIAL ENDPOINTS
# ==========================================

def generate_access_code():
    """Gera código no formato NEPT-XXXXXX"""
    chars = string.ascii_uppercase + string.digits
    code = ''.join(secrets.choice(chars) for _ in range(6))
    return f'NEPT-{code}'

@app.route('/api/trial/request', methods=['POST'])
def request_trial():
    """Solicita trial de 72h"""
    try:
        data = request.json

        # Verificar se email já existe
        existing = TrialUser.query.filter_by(email=data['email']).first()
        if existing:
            return jsonify({
                'error': 'Email já cadastrado',
                'message': 'Verifique seu email para código de acesso já enviado'
            }), 400

        # Gerar código único
        access_code = generate_access_code()
        while TrialUser.query.filter_by(access_code=access_code).first():
            access_code = generate_access_code()

        # Criar usuário trial
        trial_user = TrialUser(
            name=data['name'],
            email=data['email'],
            company=data.get('company'),
            position=data.get('position'),
            phone=data.get('phone'),
            access_code=access_code,
            lgpd_consent=data.get('lgpd', False)
        )

        db.session.add(trial_user)
        db.session.commit()

        # Enviar email com código de acesso
        email_sent = send_welcome_email(trial_user.email, trial_user.name, access_code)

        return jsonify({
            'message': 'Trial solicitado com sucesso! Verifique seu email.',
            'email': trial_user.email,
            'email_sent': email_sent,
            'access_code': access_code  # REMOVER EM PRODUÇÃO (apenas para teste)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/trial/activate', methods=['POST'])
def activate_trial():
    """Ativa trial com código de acesso"""
    try:
        data = request.json
        access_code = data.get('access_code', '').strip().upper()

        trial_user = TrialUser.query.filter_by(access_code=access_code).first()

        if not trial_user:
            return jsonify({'error': 'Código inválido'}), 404

        if not trial_user.is_approved:
            return jsonify({'error': 'Acesso não aprovado pelo administrador'}), 403

        if trial_user.status == 'EXPIRED':
            return jsonify({'error': 'Trial expirado'}), 403

        # Ativar pela primeira vez
        if not trial_user.activated_at:
            trial_user.activated_at = datetime.utcnow()
            trial_user.expires_at = datetime.utcnow() + timedelta(hours=72)
            trial_user.status = 'ACTIVE'
            db.session.commit()

        # Verificar se ainda está ativo
        if not trial_user.is_active():
            return jsonify({
                'error': 'Trial expirado',
                'expired_at': trial_user.expires_at.isoformat()
            }), 403

        return jsonify({
            'message': 'Trial ativado',
            'user': trial_user.to_dict(),
            'expires_at': trial_user.expires_at.isoformat(),
            'hours_remaining': int((trial_user.expires_at - datetime.utcnow()).total_seconds() / 3600)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trial/verify', methods=['POST'])
def verify_trial():
    """Verifica se código ainda está válido"""
    try:
        data = request.json
        access_code = data.get('access_code', '').strip().upper()

        trial_user = TrialUser.query.filter_by(access_code=access_code).first()

        if not trial_user:
            return jsonify({'valid': False, 'error': 'Código inválido'}), 200

        is_valid = trial_user.is_active()

        return jsonify({
            'valid': is_valid,
            'user': trial_user.to_dict() if is_valid else None,
            'expires_at': trial_user.expires_at.isoformat() if trial_user.expires_at else None
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==========================================
# ADMIN ENDPOINTS
# ==========================================

ADMIN_KEY = os.environ.get('ADMIN_KEY', 'NEPTUNO_ADMIN_2025')  # Mudar em produção!

def verify_admin(request):
    """Verifica se request tem chave de admin"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or auth_header != f'Bearer {ADMIN_KEY}':
        return False
    return True

@app.route('/api/admin/trials', methods=['GET'])
def list_trials():
    """Lista todos os trials (admin only)"""
    if not verify_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        status = request.args.get('status')  # PENDING, ACTIVE, EXPIRED, CONVERTED
        query = TrialUser.query

        if status:
            query = query.filter_by(status=status)

        trials = query.order_by(TrialUser.created_at.desc()).all()

        return jsonify({
            'trials': [trial.to_dict() for trial in trials],
            'total': len(trials)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/trial/<int:trial_id>', methods=['PATCH'])
def update_trial(trial_id):
    """Atualiza trial (admin only) - aprovar, rejeitar, estender"""
    if not verify_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        trial_user = TrialUser.query.get_or_404(trial_id)
        data = request.json

        if 'is_approved' in data:
            trial_user.is_approved = data['is_approved']

        if 'status' in data:
            trial_user.status = data['status']

        if 'extend_hours' in data:
            hours = int(data['extend_hours'])
            if trial_user.expires_at:
                trial_user.expires_at += timedelta(hours=hours)
            else:
                trial_user.expires_at = datetime.utcnow() + timedelta(hours=hours)

        db.session.commit()

        return jsonify({
            'message': 'Trial atualizado',
            'trial': trial_user.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/trial/<int:trial_id>', methods=['DELETE'])
def delete_trial(trial_id):
    """Deleta trial - LGPD compliance (admin only)"""
    if not verify_admin(request):
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        trial_user = TrialUser.query.get_or_404(trial_id)
        email = trial_user.email

        db.session.delete(trial_user)
        db.session.commit()

        return jsonify({
            'message': f'Dados de {email} deletados permanentemente (LGPD)'
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==========================================
# INICIALIZAÇÃO
# ==========================================

# Criar tabelas
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
