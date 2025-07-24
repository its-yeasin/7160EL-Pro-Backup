const values = {
  destinations: [
    {
      _id: 'default',
      type: 'gcloud-bucket',
      title: 'Pro Backup (Bikiran Net)',
      location: 'SG',
      projectId: 'server-net-1563652535811',
      credentials: {
        type: 'service_account',
        project_id: 'server-net-1563652535811',
        private_key_id: 'fd3c83694d71d71ae5585ac933aba61302067d18',
        private_key:
          '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSuW2WCg9JT3Cr\nqLoy+tKqOlo79sPjxpBzSIweSRbjILOFD+CZuMzq1dhTbpkJgc0SsQgzznW1i9w1\nWtjAI6LW6KRdw9qfWDse2HiNbUzcd8O0rEBNPyFfpygR7v2EkGYY3H5RaTmthw/m\nhzh4m6wbD/f1Cnzzjz6E9q7a2MBM0YW6mG3mZA3O5mtQw1u+/LL4kHjl88wI/J49\nVnsKWBSzbrH9g8pbF8LlT2auqCXB7mQssMLg0Vehb3KSKNSR0blxKdAvPPb1VVx8\nvD4181fb1AAz4Rhd+6/tfSM0tYQ+Dw5NuwqyMr5nmCtiLlZC2xkwk/IHifgDQ4hl\nsVwR1RuLAgMBAAECggEAAkROYnvPOEmre51AC4ZZN82S5Ow9pTigmyzfnP/KSD00\n0SyfjOfJBImyXwtkiA6mZxoSbYQ+DeroPoawqDh56vfrtLqDoo0vbaCEg3j2h7Se\nHVZxBqO0NzQ0ISVCAugOwRu2HCgWn8BBMoin2dxK2KuuTiuDtpcG5CVHMkF8qBbf\n53v3GoeJSKxRbBROHB1675akGKb+dJyGw7/Ai1+b1Y7KhcapP/eF3jcFEymFlvle\nF7vn5ve+FvwOzUxGLXA3gYqW6op975xF1hrbaf7Li+ZksAcPrOOPAryRkz1OweV7\nIu3iJV875w582J5FdAuD3kC2X67utT0Z3ITN0BmbkQKBgQD6hUM9kBKlkuVaSOv0\nrWDANFbx5WOwqHJOiWj8fMVC311omy/2cg5k8bRzMg6YfoqLY3b+lNtaww1BgvRu\n51tuBklw9GfmkMglw6wGDmL5qN/YqQULc+nAosMEwqMLhSyQv91G7Rqkw2m30T4o\nVllsUGGpIxhAJaPomc6UXKzYCQKBgQDXVVWzm3ERAmmcUxs8y1AJnkAtkWpNoYug\nlCYI2znHmb29YHH1Ft9OEcj2U1m7kAYjMFo3c6uG9B4Aopqf3pu3WiNiFl89Ye8Y\nFWhE6tjLm+rc8yqXpP3/42PyNu0SP4QRMf1UMvtQXfUdGuGg6xDGvdoump6aZAwp\nMa5ezPhz8wKBgEc468zs0OBRyvLIGI0PXZpHRxCubpEi0pyRZE+kCVDhv+SlehVO\nh9ka/nphmNSx5SGLvaDTISnEmlgtquB81fmJwAdk9MUQFFboMlfmby0bXchzBQQk\niChEHb2UuFXmHq1oXrhzYEfHZp7j1hARvIqWr60uVQ6npNnUIG79igZBAoGAUTBl\nndCv8t/b/gr/rA5kYRv/yq6XTCnqwWLabGBsCqwW9D5W+TfkfkUKZoXKwYNuLPpg\nKaQ9Oib04PxuHHUMdTdRO/x/cF9qjMQVilaZ4zsodKJinsag1khgOMUo4cZ8/xbA\nE20dgJHMh2rJQ6kdrDGNACFgR4oNY8LNogTacK0CgYEA+bHkmloVa2FWUfJnZmvX\nBZpUllI2P5z6QD+jBfy+pGun/JOsPRAGPOpIyS8tkZ8BoQo3eb3s1ILvOnNh5zpa\nkgPgW5kEtaRVvUMNa2r53RXda+JCmXYaxKv/OHLJ914Gam2pqf/WLqKBcep/bx1J\n2KwxS7a5vOqT5tZowRLlvG0=\n-----END PRIVATE KEY-----\n',
        client_email: '64302365669-compute@developer.gserviceaccount.com',
        client_id: '114919372737750797989',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url:
          'https://www.googleapis.com/robot/v1/metadata/x509/64302365669-compute%40developer.gserviceaccount.com',
        universe_domain: 'googleapis.com',
      },
      bucket: 'pro-backup',
    },
  ],
  frequency: 'hourly',
  backupQuantity: 100,
  backupRetention: 30, // days
  logCronPattern: '0 10 * * * *',
  logLocalRetainDays: 1,
  logRemoteRetainDays: 2,
}

module.exports = values
