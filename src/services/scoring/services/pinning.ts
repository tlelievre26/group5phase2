import { injectable } from "tsyringe";
import { ExtractedMetadata } from "../../../models/other_schemas";
import logger from "../../../utils/logger";

@injectable()
export class PinningPractice {
  private isExactVersion(version: string): boolean {
    return /^\d+\.\d+\.(x|\d)*$/.test(version);
  }

  private analyzeDependencyVersions(dependencies: Record<string, string>): { pinned: number; notPinned: number } {
    let pinned = 0;
    let notPinned = 0;

    for (const version of Object.values(dependencies)) {
      if (this.isExactVersion(version) || (version.charAt(0) == "~" && version.includes("."))) {
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
      if(dependencies === undefined) {
        logger.debug("No dependencies found in package.json")
        return 1
      }

      const { pinned, notPinned } = this.analyzeDependencyVersions(dependencies);

      const dependencyNum = Object.values(dependencies).length;

      return Math.floor(Math.round(pinned / dependencyNum * 1000) / 1000);
    } catch (error) {
      logger.error(`Error processing dependencies:` + error);
      throw new Error(`Error processing dependencies: ${error}`)
    }
  }
}
