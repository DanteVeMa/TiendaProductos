from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask import render_template



app = Flask(__name__)

# URI corregida (sin espacios)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tienda.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Modelo Producto
class Producto(db.Model):
    __tablename__ = 'productos'

    id_Producto = db.Column(db.Integer, primary_key=True)
    nombreProducto = db.Column(db.String(100), nullable=False)
    estado = db.Column(db.String(20), nullable=False)
    clasificacion = db.Column(db.String(20), nullable=False)
    precio = db.Column(db.Float, nullable=False)

    ESTADOS_VALIDOS = ['En almacen', 'Agotado', 'Disponible']
    CLASIFICACIONES_VALIDAS = ['Carne', 'Cosmetico', 'Limpieza']

    def __init__(self, nombreProducto, estado, clasificacion, precio):
        if estado not in self.ESTADOS_VALIDOS:
            raise ValueError(f"Estado inválido: {estado}")
        if clasificacion not in self.CLASIFICACIONES_VALIDAS:
            raise ValueError(f"Clasificación inválida: {clasificacion}")
        
        self.nombreProducto = nombreProducto
        self.estado = estado
        self.clasificacion = clasificacion
        self.precio = precio

    def to_dict(self):
        return {
            "id_Producto": self.id_Producto,
            "nombreProducto": self.nombreProducto,
            "estado": self.estado,
            "clasificacion": self.clasificacion,
            "precio": self.precio
        }

# Crear la base de datos
with app.app_context():
    db.create_all()



# Ruta: Obtener todos los productos
@app.route('/products', methods=['GET'])
def list_productos():
    productos = Producto.query.all()
    return jsonify([p.to_dict() for p in productos]), 200

# Ruta: Obtener un producto por ID
@app.route('/products/<int:id>', methods=['GET'])
def get_producto(id):
    producto = Producto.query.get_or_404(id)
    return jsonify(producto.to_dict()), 200

# Ruta: Crear nuevo producto
@app.route('/products', methods=['POST'])
def crear_producto():
    data = request.get_json()

    try:
        nombre = data['nombreProducto']
        estado = data['estado']
        clasificacion = data['clasificacion']
        precio = float(data['precio'])

        nuevo_producto = Producto(nombre, estado, clasificacion, precio)
        db.session.add(nuevo_producto)
        db.session.commit()

        return jsonify({"mensaje": "Producto creado correctamente", "producto": nuevo_producto.to_dict()}), 201

    except KeyError as e:
        return jsonify({"error": f"Campo faltante: {str(e)}"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# Ruta: Actualizar producto existente
@app.route('/products/<int:id>', methods=['PUT'])
def actualizar_producto(id):
    producto = Producto.query.get_or_404(id)
    data = request.get_json()

    try:
        producto.nombreProducto = data.get('nombreProducto', producto.nombreProducto)
        producto.estado = data.get('estado', producto.estado)
        producto.clasificacion = data.get('clasificacion', producto.clasificacion)
        producto.precio = float(data.get('precio', producto.precio))

        db.session.commit()
        return jsonify({"mensaje": "Producto actualizado correctamente", "producto": producto.to_dict()}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# Ruta: Eliminar producto
@app.route('/products/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    producto = Producto.query.get_or_404(id)
    db.session.delete(producto)
    db.session.commit()
    return jsonify({"mensaje": "Producto eliminado correctamente"}), 200


@app.route('/')
def index():
    return render_template('index.html')

# Servidor
if __name__ == "__main__":
    app.run(debug=False)


