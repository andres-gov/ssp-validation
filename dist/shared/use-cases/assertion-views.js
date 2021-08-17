import {fold} from "../../../_snowpack/pkg/fp-ts/Either.js";
import {pipe} from "../../../_snowpack/pkg/fp-ts/lib/function.js";
import * as t from "../../../_snowpack/pkg/io-ts.js";
const AssertionGroup = t.recursion("AssertionGroup", () => t.type({
  title: t.string,
  assertionIds: t.array(t.string),
  groups: t.union([t.array(AssertionGroup), t.undefined])
}));
const AssertionView = t.type({
  title: t.string,
  groups: t.array(AssertionGroup)
});
const AssertionViews = t.array(AssertionView);
export const validateAssertionViews = (input) => {
  return pipe(AssertionViews.decode(input), fold(() => null, (value) => value));
};
export const WriteAssertionViews = (ctx) => async () => {
  const stylesheetSEFText = await ctx.readStringFile(ctx.paths.assertionViewSEFPath);
  const schematronXML = await ctx.readStringFile(ctx.paths.schematronXMLPath);
  const assertionViewJSON = await ctx.processXSLT(stylesheetSEFText, schematronXML);
  const assertionViews = validateAssertionViews(JSON.parse(assertionViewJSON));
  await ctx.writeStringFile(ctx.paths.outputFilePath, JSON.stringify(assertionViews));
  console.log(`Wrote ${ctx.paths.outputFilePath}`);
};
