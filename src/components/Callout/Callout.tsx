import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Callout as RadixCallout } from "@radix-ui/themes";

interface Props {
  children: React.ReactNode;
}

export default function Callout({ children }: Props) {
  return (
    <RadixCallout.Root>
      <RadixCallout.Icon>
        <InfoCircledIcon />
      </RadixCallout.Icon>
      <RadixCallout.Text>{children}</RadixCallout.Text>
    </RadixCallout.Root>
  );
}
