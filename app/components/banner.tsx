import Image from "next/image";
import Link from "next/link";

export function MainBanner() {
    return (
        <span className="flex mb-14 dark:text-neutral-100 text-neutral-950 gap-2 flex-col-reverse sm:flex-row">
            <div className="flex-row flex-2">
                <Link href={"https://gopalji.me"}>
                    <h1 className="text-5xl font-semibold relative tracking-tight">
                        Gopalji Gaur
                    </h1>
                </Link>
                <h2 className="text-2xl tracking-tight mt-6">
                    <p className="font-semibold bg-gradient-to-tr from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text leading-normal">
                        Machine Learning Engineer
                    </p>
                    <br></br>
                    based in
                    Freiburg, Germany.
                </h2>
            </div>
            <div className="flex-1 content-center min-w-[128px] justify-items-start sm:justify-items-end mb-4 sm:mb-0">
                <Image
                    alt='Gopalji Gaur'
                    height={128}
                    width={128}
                    priority={true}
                    src='https://www.gravatar.com/avatar/0d634a9edf65bcc4916888473f10b1e6?size=200'
                    className="rounded-full bg-neutral-200 dark:bg-neutral-800 dark:brightness-90 dark:saturate-[0.85] transition"
                />
            </div>
        </span>
    );
}

export function Banner(props) {
    return (
        <span className="inline-flex mb-16">
            <div className="w-[48px] relative self-center">
                <Image
                    alt='Gopalji Gaur'
                    height={48}
                    width={48}
                    priority={true}
                    src='https://www.gravatar.com/avatar/0d634a9edf65bcc4916888473f10b1e6?size=200'
                    className="rounded-full bg-neutral-200 dark:bg-neutral-800 dark:brightness-90 dark:saturate-[0.85] transition"
                />
            </div>
            <h1 className="mt-2.5 ml-5 text-2xl font-semibold relative tracking-tight">
                <span className="mr-5">/</span>
                {props.children}
            </h1>
        </span>
    );
}