FROM golang:1.22

# Install essential packages
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Install Go tools
RUN go install golang.org/x/tools/gopls@v0.14.2 && \
    go install github.com/go-delve/delve/cmd/dlv@latest && \
    go install honnef.co/go/tools/cmd/staticcheck@latest

# Set environment variables
ENV PATH="/go/bin:${PATH}"
ENV GO111MODULE=on
ENV GOPATH=/go
