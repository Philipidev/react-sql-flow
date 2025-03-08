-- Tabela Usuario com PK e restrições
CREATE TABLE Usuario (
    UsuarioID INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    Senha NVARCHAR(255) NOT NULL,
    DataNascimento DATE CHECK (DataNascimento <= GETDATE())
);

-- Tabela Categoria
CREATE TABLE Categoria (
    CategoriaID INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(100) NOT NULL
);

-- Tabela Produto com FK para Categoria
CREATE TABLE Produto (
    ProdutoID INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(100) NOT NULL,
    Preco DECIMAL(10,2) NOT NULL CHECK (Preco >= 0),
    CategoriaID INT NOT NULL,
    FOREIGN KEY (CategoriaID) REFERENCES Categoria(CategoriaID)
);

-- Tabela Pedido
CREATE TABLE Pedido (
    PedidoID INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioID INT NOT NULL,
    DataPedido DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UsuarioID) REFERENCES Usuario(UsuarioID)
);

-- Tabela PedidoProduto (Relacionamento N:N entre Pedido e Produto)
CREATE TABLE PedidoProduto (
    PedidoProdutoID INT IDENTITY(1,1) PRIMARY KEY,
    PedidoID INT NOT NULL,
    ProdutoID INT NOT NULL,
    Quantidade INT NOT NULL CHECK (Quantidade > 0),
    PrecoUnitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (PedidoID) REFERENCES Pedido(PedidoID),
    FOREIGN KEY (ProdutoID) REFERENCES Produto(ProdutoID)
);
