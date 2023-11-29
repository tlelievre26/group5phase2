import { injectable } from "tsyringe";
import { ExtractedMetadata } from "../../../models/other_schemas";

@injectable()
export class PinningPractice {
  private isExactVersion(version: string): boolean {
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  private analyzeDependencyVersions(dependencies: Record<string, string>): { pinned: number; notPinned: number } {
    let pinned = 0;
    let notPinned = 0;

    for (const version of Object.values(dependencies)) {
      if (this.isExactVersion(version)) {
        pinned++;
      } else {
        notPinned++;
      }
    }

    return { pinned, notPinned };
  }

  public async pinningDependencies(metadata_files: ExtractedMetadata): Promise<number> {
    try {
      const pkgjson_data: { dependencies: Record<string, string> } = JSON.parse(metadata_files["package.json"].toString());
      const dependencies = pkgjson_data.dependencies;

      const { pinned, notPinned } = this.analyzeDependencyVersions(dependencies);

      const dependencyNum = Object.values(dependencies).length;

      if (dependencyNum === 0) {
        return 1;
      }

      return pinned / dependencyNum;
    } catch (error) {
      console.error(`Error processing dependencies:` + error);
      return -1;
    }
  }
}
