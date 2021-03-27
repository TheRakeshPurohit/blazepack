type StartDevServerOptions = {
  directory: string;
  port?: number;
  openInBrowser?: boolean;
  onSuccess?: (server: any) => void;
  onError?: (err: Error) => void;
};

type CreateProjectOptions = {
  projectName: string;
  templateId: string;
  startServer?: boolean;
  port?: number;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
};

type ExportSandboxOptions = {
  directory: string;
  openInBrowser?: boolean;
  onSuccess?: (sandboxId: string) => void;
  onError?: (err: Error) => void;
};

declare interface Blazepack {
  commands: {
    startDevServer: (options: StartDevServerOptions) => void;
    createProject: (options: CreateProjectOptions) => void;
    exportSandbox: (options: ExportSandboxOptions) => void;
  };
  utils: {
    detectTemplate: (directory: string) => string;
  };
  constants: {
    TEMPLATES: Record<string, string>;
  };
}

declare module 'blazepack' {
  namespace commands {
    function startDevServer(options: StartDevServerOptions): void;
    function createProject(options: CreateProjectOptions): void;
    function exportSandbox(options: ExportSandboxOptions): void;
  }

  namespace utils {
    function detectTemplate(directory: string): string;
  }

  namespace constants {
    var TEMPLATES: Record<string, string>;
  }
}
